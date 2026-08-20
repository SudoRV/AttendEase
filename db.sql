-- =========================================================
-- 1. COLLEGES TABLE
-- =========================================================

CREATE TABLE colleges (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    college_id VARCHAR(12) NOT NULL,
    college_name VARCHAR(255) NOT NULL,
    college_address JSON NOT NULL,
    university VARCHAR(255) NOT NULL,

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    class_duration SMALLINT UNSIGNED NOT NULL,

    semester_start_date DATE NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_colleges_college_id
        UNIQUE (college_id),

    CONSTRAINT chk_college_class_duration
        CHECK (class_duration > 0),

    CONSTRAINT chk_college_time
        CHECK (end_time > start_time)
) ENGINE=InnoDB;


-- =========================================================
-- 2. COURSES TABLE
-- =========================================================

CREATE TABLE courses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    college_id VARCHAR(12) NOT NULL,

    course_code VARCHAR(50) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    total_semesters TINYINT UNSIGNED NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_courses_colleges
        FOREIGN KEY (college_id)
        REFERENCES colleges(college_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_college_course
        UNIQUE (college_id, course_code)
) ENGINE=InnoDB;


-- =========================================================
-- 3. DEPARTMENTS TABLE
-- =========================================================

CREATE TABLE departments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    course_id INT UNSIGNED NOT NULL,

    department_name VARCHAR(255) NOT NULL,
    department_code VARCHAR(50) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_departments_courses
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_course_dept
        UNIQUE (course_id, department_code),

    CONSTRAINT chk_total_semesters
        CHECK (total_semesters > 0)
) ENGINE=InnoDB;