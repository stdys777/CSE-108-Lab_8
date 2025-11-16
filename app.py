from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
from config import Config
from models import db, User, Course, enrollments

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Import and register blueprints (keep admin separate)
from admin_views import init_admin
init_admin(app, db, bcrypt)

# Sample data creation
def create_sample_data():
    """Create sample users and courses for testing"""
    admin = User(
        username='admin',
        password_hash=bcrypt.generate_password_hash('admin123').decode('utf-8'),
        full_name='System Admin',
        email='admin@acme.edu',
        role='admin'
    )
    
    teacher1 = User(
        username='ahepworth',
        password_hash=bcrypt.generate_password_hash('password').decode('utf-8'),
        full_name='Dr. Ammon Hepworth',
        email='ahepworth@acme.edu',
        role='teacher'
    )
    
    teacher2 = User(
        username='swalker',
        password_hash=bcrypt.generate_password_hash('password').decode('utf-8'),
        full_name='Dr. Susan Walker',
        email='swalker@acme.edu',
        role='teacher'
    )
    
    student1 = User(
        username='cnorris',
        password_hash=bcrypt.generate_password_hash('password').decode('utf-8'),
        full_name='Chuck Norris',
        email='cnorris@acme.edu',
        role='student'
    )
    
    student2 = User(
        username='msmith',
        password_hash=bcrypt.generate_password_hash('password').decode('utf-8'),
        full_name='Mindy Smith',
        email='msmith@acme.edu',
        role='student'
    )
    
    db.session.add_all([admin, teacher1, teacher2, student1, student2])
    db.session.commit()
    
    course1 = Course(
        course_code='CS 106',
        course_name='Introduction to Computer Science',
        teacher_id=teacher1.id,
        time_schedule='MWF 2:00-2:50 PM',
        capacity=10
    )
    
    course2 = Course(
        course_code='CS 162',
        course_name='Data Structures',
        teacher_id=teacher1.id,
        time_schedule='TR 3:00-3:50 PM',
        capacity=4
    )
    
    course3 = Course(
        course_code='Physics 121',
        course_name='General Physics',
        teacher_id=teacher2.id,
        time_schedule='TR 11:00-11:50 AM',
        capacity=10
    )
    
    db.session.add_all([course1, course2, course3])
    db.session.commit()
    
    student1.enrolled_courses.append(course1)
    student1.enrolled_courses.append(course3)
    db.session.commit()

# Create database tables
with app.app_context():
    db.create_all()
    if User.query.count() == 0:
        create_sample_data()

# ===== SHARED API ENDPOINTS =====

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page"""
    from login_page import render_login_page
    
    if request.method == 'GET':
        return render_login_page()
    
    # POST request - process login
    username = request.form.get('username')
    password = request.form.get('password')
    user = User.query.filter_by(username=username).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, password):
        login_user(user)
        if user.role == 'admin':
            return redirect('/admin')
        elif user.role == 'teacher':
            return redirect('http://localhost:3000/teacher')  
        elif user.role == 'student':
            return redirect('http://localhost:3000/student')  
    
    return render_login_page(error="Invalid username or password")

@app.route('/api/login', methods=['POST'])
def api_login():
    """API endpoint for React frontend"""
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        login_user(user)
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'role': user.role
            }
        })
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/teacher', methods=['POST'])

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'success': True})

@app.route('/logout', methods=['GET'])
@login_required
def logout_button():
    logout_user()
    return redirect('/login')

@app.route('/api/current-user', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'full_name': current_user.full_name,
        'role': current_user.role
    })

@app.route('/api/courses', methods=['GET'])
@login_required
def get_courses():
    """Get all courses with enrollment info"""
    courses = Course.query.all()
    return jsonify([{
        'id': course.id,
        'course_code': course.course_code,
        'course_name': course.course_name,
        'teacher_name': course.teacher.full_name,
        'time_schedule': course.time_schedule,
        'enrolled': course.current_enrollment(),
        'capacity': course.capacity,
        'is_full': course.is_full()
    } for course in courses])

@app.route('/api/my-courses', methods=['GET'])
@login_required
def get_my_courses():
    """Get courses for current user (student or teacher)"""
    if current_user.role == 'student':
        result = db.session.query(Course, enrollments.c.grade) \
            .join(enrollments, Course.id == enrollments.c.course_id) \
            .filter(enrollments.c.student_id == current_user.id) \
            .all()

        return jsonify([
            {
                'id': course.id,
                'course_code': course.course_code,
                'course_name': course.course_name,
                'teacher_name': course.teacher.full_name,
                'time_schedule': course.time_schedule,
                'enrolled': course.current_enrollment(),
                'capacity': course.capacity,
                'grade': grade
            }
            for course, grade in result
        ])

    elif current_user.role == 'teacher':
        courses = current_user.taught_courses
        return jsonify([
            {
                'id': course.id,
                'course_code': course.course_code,
                'course_name': course.course_name,
                'time_schedule': course.time_schedule,
                'enrolled': course.current_enrollment(),
                'capacity': course.capacity
            }
            for course in courses
        ])

    return jsonify([])


@app.route('/api/enroll/<int:course_id>', methods=['POST'])
@login_required
def enroll_course(course_id):
    """Enroll student in a course"""
    if current_user.role != 'student':
        return jsonify({'success': False, 'message': 'Only students can enroll'}), 403
    
    course = Course.query.get_or_404(course_id)
    
    if course.is_full():
        return jsonify({'success': False, 'message': 'Course is full'}), 400
    
    if course in current_user.enrolled_courses:
        return jsonify({'success': False, 'message': 'Already enrolled'}), 400
    
    current_user.enrolled_courses.append(course)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Enrolled successfully'})

@app.route('/api/course/<int:course_id>/students', methods=['GET'])
@login_required
def get_course_students(course_id):
    """Get all students in a course with grades (teacher only)"""
    if current_user.role != 'teacher':
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    
    course = Course.query.get_or_404(course_id)
    
    if course.teacher_id != current_user.id:
        return jsonify({'success': False, 'message': 'Not your course'}), 403
    
    result = db.session.query(User, enrollments.c.grade)\
        .join(enrollments, User.id == enrollments.c.student_id)\
        .filter(enrollments.c.course_id == course_id).all()
    
    return jsonify([{
        'id': student.id,
        'full_name': student.full_name,
        'email': student.email,
        'grade': grade
    } for student, grade in result])

@app.route('/api/update-grade/<int:course_id>/<int:student_id>', methods=['PUT'])
@login_required
def update_grade(course_id, student_id):
    """Update a student's grade in a course"""
    if current_user.role != 'teacher':
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    
    course = Course.query.get_or_404(course_id)
    
    if course.teacher_id != current_user.id:
        return jsonify({'success': False, 'message': 'Not your course'}), 403
    
    grade = request.json.get('grade')
    
    stmt = enrollments.update()\
        .where(enrollments.c.course_id == course_id)\
        .where(enrollments.c.student_id == student_id)\
        .values(grade=grade)
    
    db.session.execute(stmt)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Grade updated'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
