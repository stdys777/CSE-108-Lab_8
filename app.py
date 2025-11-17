from flask import Flask, jsonify, request, redirect, send_from_directory
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
from config import Config
from models import db, User, Course, enrollments
from datetime import datetime
import os

# Setup Flask to serve React build
app = Flask(__name__, static_folder='frontend/build', static_url_path='')
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
# Remove CORS since everything is on same domain now
# CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# -------- Admin Panel --------
# -------- Admin Panel --------
from admin_views import init_admin
init_admin(app, db, bcrypt)

# -------- Create sample data (only once) --------
# -------- Create sample data (only once) --------
def create_sample_data():
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



with app.app_context():
    db.create_all()
    if User.query.count() == 0:
        create_sample_data()

# -------------------------------------------------------
#                    AUTH ROUTES
# -------------------------------------------------------
# -------------------------------------------------------
#                    AUTH ROUTES
# -------------------------------------------------------

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Traditional Flask login page."""
    from login_page import render_login_page

    if request.method == "GET":

    if request.method == "GET":
        return render_login_page()

    username = request.form.get("username")
    password = request.form.get("password")

    username = request.form.get("username")
    password = request.form.get("password")
    user = User.query.filter_by(username=username).first()


    if user and bcrypt.check_password_hash(user.password_hash, password):
        login_user(user)

        if user.role == "admin":
            return redirect("/admin")
        elif user.role == "teacher":
            return redirect("/teacher")
        elif user.role == "student":
            return redirect("/student")

    return render_login_page(error="Invalid username or password")

@app.route('/api/login', methods=['POST'])
def api_login():
    """Login used by React frontend."""
    """Login used by React frontend."""
    data = request.json
    user = User.query.filter_by(username=data.get("username")).first()

    if user and bcrypt.check_password_hash(user.password_hash, data.get("password")):
    user = User.query.filter_by(username=data.get("username")).first()

    if user and bcrypt.check_password_hash(user.password_hash, data.get("password")):
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


# -------------------------------------------------------
#                  STUDENT + TEACHER API
# -------------------------------------------------------

# -------------------------------------------------------
#                  STUDENT + TEACHER API
# -------------------------------------------------------

@app.route('/api/logout', methods=['POST'])
@login_required
def api_logout():
def api_logout():
    logout_user()
    return jsonify({'success': True})

@app.route('/logout')
@app.route('/logout')
@login_required
def logout_redirect():
def logout_redirect():
    logout_user()
    return redirect('/login')

@app.route('/api/current-user')
@app.route('/api/current-user')
@login_required
def api_current_user():
def api_current_user():
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'full_name': current_user.full_name,
        'role': current_user.role
    })

@app.route('/api/courses')
@app.route('/api/courses')
@login_required
def api_courses():
    """Return all courses with enrollment info."""
def api_courses():
    """Return all courses with enrollment info."""
    courses = Course.query.all()
    return jsonify([
        {
            'id': c.id,
            'course_code': c.course_code,
            'course_name': c.course_name,
            'teacher_name': c.teacher.full_name,
            'time_schedule': c.time_schedule,
            'enrolled': c.current_enrollment(),
            'capacity': c.capacity,
            'is_full': c.is_full()
        }
        for c in courses
    ])
    return jsonify([
        {
            'id': c.id,
            'course_code': c.course_code,
            'course_name': c.course_name,
            'teacher_name': c.teacher.full_name,
            'time_schedule': c.time_schedule,
            'enrolled': c.current_enrollment(),
            'capacity': c.capacity,
            'is_full': c.is_full()
        }
        for c in courses
    ])

@app.route('/api/my-courses')
@app.route('/api/my-courses')
@login_required
def api_my_courses():
    """Return student's courses OR teacher's courses."""
    if current_user.role == "student":
def api_my_courses():
    """Return student's courses OR teacher's courses."""
    if current_user.role == "student":
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

    if current_user.role == "teacher":
    if current_user.role == "teacher":
        return jsonify([
            {
                'id': c.id,
                'course_code': c.course_code,
                'course_name': c.course_name,
                'time_schedule': c.time_schedule,
                'enrolled': c.current_enrollment(),
                'capacity': c.capacity
                'id': c.id,
                'course_code': c.course_code,
                'course_name': c.course_name,
                'time_schedule': c.time_schedule,
                'enrolled': c.current_enrollment(),
                'capacity': c.capacity
            }
            for c in current_user.taught_courses
            for c in current_user.taught_courses
        ])

    return jsonify([])

@app.route('/api/enroll/<int:course_id>', methods=['POST'])
@login_required
def api_enroll(course_id):
    if current_user.role != "student":
def api_enroll(course_id):
    if current_user.role != "student":
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


# -------------------------------------------------------
#                  SERVE REACT APP
# -------------------------------------------------------

# Remove the catch-all routes and replace with this simpler approach:

@app.route('/teacher')
@app.route('/teacher/<path:subpath>')
@app.route('/student')
@app.route('/student/<path:subpath>')
def serve_react_pages(subpath=''):
    """Serve React app for teacher/student pages"""
    return send_from_directory(app.static_folder, 'index.html')

# Also add a root route
@app.route('/')
def index():
    return redirect('/login')

# -------------------------------------------------------
#                    START SERVER
# -------------------------------------------------------

if __name__ == '__main__':
    app.run(debug=True, port=5000)