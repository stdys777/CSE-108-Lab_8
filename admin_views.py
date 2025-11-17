from flask import redirect, url_for
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from flask_admin.menu import MenuLink
from flask_login import current_user
from wtforms import PasswordField, SelectField
from wtforms.validators import DataRequired, Length, Optional

class SecureAdminIndexView(AdminIndexView):
    @expose('/')
    def index(self):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return redirect('/login')
        
        from models import User, Course, enrollments, db
        
        # Get statistics for dashboard
        total_users = User.query.count()
        total_students = User.query.filter_by(role='student').count()
        total_teachers = User.query.filter_by(role='teacher').count()
        total_courses = Course.query.count()
        total_enrollments = db.session.query(enrollments).count()
        
        return self.render('admin/index.html',
                         total_users=total_users,
                         total_students=total_students,
                         total_teachers=total_teachers,
                         total_courses=total_courses,
                         total_enrollments=total_enrollments)
    
    def is_accessible(self):
        return current_user.is_authenticated and current_user.role == 'admin'
    
    def inaccessible_callback(self, name, **kwargs):
        return redirect('/login')

class SecureModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.role == 'admin'
    
    def inaccessible_callback(self, name, **kwargs):
        return redirect('/login')
    
    can_export = True
    export_types = ['csv', 'xlsx']

class UserAdminView(SecureModelView):
    column_list = ['id', 'username', 'full_name', 'email', 'role']
    column_searchable_list = ['username', 'full_name', 'email']
    column_filters = ['role', 'email']
    column_sortable_list = ['id', 'username', 'full_name', 'email', 'role']
    column_default_sort = ('id', False)
    
    column_exclude_list = ['password_hash']
    form_excluded_columns = ['password_hash', 'enrolled_courses', 'taught_courses']
    
    column_labels = {
        'username': 'Username',
        'full_name': 'Full Name',
        'email': 'Email Address',
        'role': 'User Role'
    }
    
    page_size = 20
    
    form_extra_fields = {
        'password': PasswordField('Password', validators=[Optional()]),
    }
    
    form_args = {
        'username': {
            'validators': [DataRequired(), Length(min=3, max=80)]
        },
        'full_name': {
            'validators': [DataRequired(), Length(min=2, max=120)]
        },
        'email': {
            'validators': [DataRequired()]
        },
        'role': {
            'validators': [DataRequired()]
        }
    }
    
    def __init__(self, model, session, bcrypt, **kwargs):
        self.bcrypt = bcrypt
        super(UserAdminView, self).__init__(model, session, **kwargs)
    
    def on_model_change(self, form, model, is_created):
        if form.password.data:
            model.password_hash = self.bcrypt.generate_password_hash(
                form.password.data
            ).decode('utf-8')
    
    def scaffold_form(self):
        form_class = super(UserAdminView, self).scaffold_form()
        form_class.password = PasswordField('Password')
        form_class.password.kwargs['validators'] = [Optional()]
        if hasattr(form_class, 'password_hash'):
            delattr(form_class, 'password_hash')
        return form_class

class CourseAdminView(SecureModelView):
    column_list = ['id', 'course_code', 'course_name', 'teacher', 'time_schedule', 
                   'capacity', 'current_enrollment']
    column_searchable_list = ['course_code', 'course_name']
    column_filters = ['teacher', 'capacity']
    column_sortable_list = ['id', 'course_code', 'course_name', 'capacity']
    
    column_labels = {
        'course_code': 'Course Code',
        'course_name': 'Course Name',
        'teacher': 'Instructor',
        'time_schedule': 'Schedule',
        'capacity': 'Max Capacity'
    }
    
    page_size = 20
    
    def _current_enrollment_formatter(view, context, model, name):
        return model.current_enrollment()
    
    def _teacher_formatter(view, context, model, name):
        return model.teacher.full_name if model.teacher else 'N/A'
    
    column_formatters = {
        'current_enrollment': _current_enrollment_formatter,
        'teacher': _teacher_formatter
    }
    
    form_args = {
        'course_code': {
            'validators': [DataRequired(), Length(min=2, max=20)]
        },
        'course_name': {
            'validators': [DataRequired(), Length(min=3, max=100)]
        },
        'time_schedule': {
            'validators': [DataRequired()]
        },
        'capacity': {
            'validators': [DataRequired()]
        }
    }
    
    def _teacher_query_factory(self):
        from models import User
        return self.session.query(User).filter_by(role='teacher')
    
    form_ajax_refs = {
        'teacher': {
            'fields': ['full_name', 'email'],
            'page_size': 10
        }
    }

class EnrollmentAdminView(SecureModelView):
    column_list = ['student', 'course', 'grade', 'enrolled_at']
    column_labels = {
        'student': 'Student',
        'course': 'Course',
        'grade': 'Grade',
        'enrolled_at': 'Enrollment Date'
    }
    
    can_create = True
    can_edit = True
    can_delete = True
    
    page_size = 20

def init_admin(app, db, bcrypt):
    from models import User, Course
    
    admin = Admin(
        app, 
        name='ACME Admin Portal',
        index_view=SecureAdminIndexView()
    )
    
    admin.add_view(UserAdminView(User, db.session, bcrypt, name='Users'))
    admin.add_view(CourseAdminView(Course, db.session, name='Courses'))
    
    # Add logout link to navbar
    admin.add_link(MenuLink(name='Logout', endpoint='logout_redirect'))
    
    return admin