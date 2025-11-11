from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

# Association table for many-to-many relationship
enrollments = db.Table('enrollments',
    db.Column('student_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('course_id', db.Integer, db.ForeignKey('course.id'), primary_key=True),
    db.Column('grade', db.Integer, nullable=True),  # Grade for the student in this course
    db.Column('enrolled_at', db.DateTime, default=datetime.utcnow)
)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'teacher', 'admin'
    
    # Relationships
    enrolled_courses = db.relationship('Course', secondary=enrollments, 
                                      backref=db.backref('enrolled_students', lazy='dynamic'))
    taught_courses = db.relationship('Course', backref='teacher', lazy=True, 
                                    foreign_keys='Course.teacher_id')
    
    def __repr__(self):
        return f'<User {self.username} - {self.role}>'

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(20), unique=True, nullable=False)  # e.g., "CS 106"
    course_name = db.Column(db.String(100), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    time_schedule = db.Column(db.String(50), nullable=False)  # e.g., "MWF 2:00-2:50 PM"
    capacity = db.Column(db.Integer, nullable=False, default=10)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def current_enrollment(self):
        return self.enrolled_students.count()
    
    def is_full(self):
        return self.current_enrollment() >= self.capacity
    
    def __repr__(self):
        return f'<Course {self.course_code}>'