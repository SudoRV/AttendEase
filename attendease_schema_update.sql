-- AttendEase full schema and seed data for server2.js and server/src controllers.
-- Includes the tables and available rows from attendease_db.sql, adapted to
-- the updated schema, plus colleges, courses, and branches metadata.
--
-- Intended for a fresh database. The metadata labels "College 67" and
-- "Legacy course 1" are placeholders inferred from legacy numeric IDs; replace
-- them and the course code if the institution's official metadata differs.
-- CREATE TABLE IF NOT EXISTS does not alter existing tables.

CREATE TABLE IF NOT EXISTS colleges (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  college_id VARCHAR(32) DEFAULT NULL,
  college_name VARCHAR(255) NOT NULL,
  university VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_colleges_name (college_name),
  KEY idx_colleges_code (college_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS courses (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  college_id INT UNSIGNED NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  course_id VARCHAR(32) NOT NULL,
  total_semesters TINYINT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_courses_college (college_id),
  KEY idx_courses_code (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS branches (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  branch_name VARCHAR(255) NOT NULL,
  branch_id VARCHAR(12) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_branches_code (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id VARCHAR(20) DEFAULT NULL,
  student_id VARCHAR(20) DEFAULT NULL,
  teacher_id VARCHAR(32) DEFAULT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash CHAR(60) NOT NULL,
  role ENUM('Student', 'Teacher', 'Admin', 'HOD', 'Director') NOT NULL DEFAULT 'Student',
  semester TINYINT UNSIGNED DEFAULT NULL,
  year TINYINT UNSIGNED DEFAULT NULL,
  start_month TINYINT UNSIGNED DEFAULT NULL,
  otp JSON DEFAULT NULL,
  section CHAR(1) DEFAULT 'A',
  college_id INT UNSIGNED DEFAULT NULL,
  course_id VARCHAR(32) DEFAULT NULL,
  token_version INT UNSIGNED NOT NULL DEFAULT 1,
  collegeId INT UNSIGNED DEFAULT NULL,
  admissionId INT UNSIGNED DEFAULT NULL,
  courseId INT UNSIGNED DEFAULT NULL,
  branchId INT UNSIGNED DEFAULT NULL,
  branch_id VARCHAR(12) DEFAULT NULL,
  branch_name VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_user_id (user_id),
  KEY idx_users_student_id (student_id),
  KEY idx_users_teacher_id (teacher_id),
  KEY idx_users_college_course (college_id, course_id, branch_id, year, section),
  KEY idx_users_legacy_branch_semester (branchId, semester, section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS schedule (
  id INT NOT NULL AUTO_INCREMENT,
  college_id INT UNSIGNED DEFAULT NULL,
  course_id VARCHAR(32) DEFAULT NULL,
  branch_id VARCHAR(12) NOT NULL,
  branch_name VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  semester TINYINT NOT NULL,
  section CHAR(1) NOT NULL DEFAULT 'A',
  day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
  period_id INT NOT NULL,
  subject_id VARCHAR(16) NOT NULL,
  subject_name VARCHAR(120) NOT NULL,
  room_number INT DEFAULT NULL,
  teacher_id VARCHAR(32) DEFAULT NULL,
  teacher_name VARCHAR(64) DEFAULT NULL,
  cancelled TINYINT(1) NOT NULL DEFAULT 0,
  cancelled_from DATETIME DEFAULT NULL,
  cancelled_to DATETIME DEFAULT NULL,
  substitute_teacher_id VARCHAR(32) DEFAULT NULL,
  substitute_teacher_name VARCHAR(64) DEFAULT NULL,
  substituted_till DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_schedule_student (college_id, course_id, year, branch_id, section, day, period_id),
  KEY idx_schedule_teacher (college_id, teacher_id, day, period_id),
  KEY idx_schedule_branch_year_section (branch_id, year, section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS leaves (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED DEFAULT NULL,
  name VARCHAR(100) DEFAULT NULL,
  year INT DEFAULT NULL,
  branch VARCHAR(50) DEFAULT NULL,
  student_id VARCHAR(32) DEFAULT NULL,
  teacher_id VARCHAR(32) DEFAULT NULL,
  subject VARCHAR(512) DEFAULT NULL,
  application TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  applicable_from TIMESTAMP NOT NULL,
  applicable_to TIMESTAMP NOT NULL,
  status VARCHAR(12) NOT NULL,
  section CHAR(1) DEFAULT 'A',
  affected_days SET('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_leaves_user_created (user_id, created_at),
  KEY idx_leaves_student_dates (student_id, applicable_from, applicable_to),
  KEY idx_leaves_teacher_dates (teacher_id, applicable_from, applicable_to),
  KEY idx_leaves_dates_status (applicable_to, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS announcements (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_by JSON DEFAULT NULL,
  scope VARCHAR(16) NOT NULL DEFAULT 'students',
  target_college INT UNSIGNED DEFAULT NULL,
  target_course JSON DEFAULT NULL,
  target_year JSON DEFAULT NULL,
  target_branch JSON DEFAULT NULL,
  target_section JSON DEFAULT NULL,
  status VARCHAR(12) DEFAULT 'Active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_announcements_target_expiry (target_college, status, expires_at),
  KEY idx_announcements_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS fcm_tokens (
  id INT NOT NULL AUTO_INCREMENT,
  user_id VARCHAR(20) NOT NULL,
  device_name VARCHAR(50) DEFAULT NULL,
  device_id VARCHAR(50) DEFAULT NULL,
  fcm_token VARCHAR(512) NOT NULL,
  active ENUM('0', '1') DEFAULT '1',
  last_updated TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_fcm_user_device (user_id, device_id),
  KEY idx_fcm_user (user_id),
  KEY idx_fcm_token (fcm_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Legacy metadata is incomplete. College ID 67 and course ID 1 are inferred
-- from users.collegeId/courseId; replace the placeholder names/codes as needed.
INSERT INTO colleges (id, college_id, college_name, university)
VALUES (67, '67', 'College 67', NULL);

INSERT INTO courses (id, college_id, course_name, course_id, total_semesters)
VALUES (1, 67, 'Legacy course 1', '1', 8);

INSERT INTO branches (id, branch_name, branch_id)
VALUES (1, 'Computer Science and Engineering', 'CSE');

-- Existing accounts. OTPs are intentionally cleared because the dump's OTP
-- is stale; password hashes are retained so the source accounts can log in.
INSERT INTO users (
  id, user_id, student_id, teacher_id, name, email, password_hash, role,
  semester, year, start_month, otp, section, college_id, course_id,
  token_version, collegeId, admissionId, courseId, branchId, branch_id,
  branch_name, created_at, updated_at
) VALUES
  (13, 'Gz4xcW1P9vYFnLHk', NULL, 'T_RISHABH', 'Rishabh Kushwaha ',
   'rishabh.1988@gmail.com', '$2b$10$KGR0Lp12nCD2ONMEAVRzSulxwBMG3grRTZjNSv9YWtY/U4hEQRrkq',
   'Teacher', NULL, NULL, NULL, NULL, 'A', 67, '1', 1, NULL, NULL, NULL, NULL, NULL, NULL,
   '2026-04-16 22:07:02', '2026-04-17 10:47:00'),
  (15, 'cKCu4uJ8HD0nBe4g', NULL, 'T_CST043', 'Komal Gahtori',
   'komal@gmail.com', '$2b$10$jsJ4xFwxLkIYfYYrT6i/xeXNwBH8DN89ka5VjUS/Mh67XqyGBAImG',
   'Teacher', NULL, NULL, NULL, NULL, 'A', 67, '1', 1, NULL, NULL, NULL, NULL, NULL, NULL,
   '2026-04-17 10:55:25', '2026-04-17 10:55:25'),
  (16, 'hgY0XIWirbeWcIdo', '221620101047', NULL, 'Rahul Verma ',
   'rahulverma.1.2005@gmail.com', '$2b$10$9rUfNNmmSQfYgMIwHl45xeipXi/W3nDiRz2VzJ1zURKjcOHXRCVAm',
   'Student', 8, 4, 1, NULL, 'A', 67, '1', 1, 67, 11492, 1, 1, 'CSE', NULL,
   '2026-04-17 14:14:45', '2026-04-23 16:14:46'),
  (17, 'IryIbIJy06eYRh82', NULL, 'T_AHT016', 'Jagat Pal Singh',
   'jagat@gmail.com', '$2b$10$4CCccMwku.ogRMbRgC/n8ODZlJoDy.wgnoYu1iv0EL7aybnNvWUli',
   'Teacher', NULL, NULL, NULL, NULL, 'A', 67, '1', 1, NULL, NULL, NULL, NULL, NULL, NULL,
   '2026-04-17 15:33:59', '2026-04-23 19:10:27'),
  (18, '1BAm16e2wFZl4ir9', '221620101047', NULL, 'Anu Verma',
   'anu@gmail.com', '$2b$10$vzNt3VIz3bprXmXDJTp2TuWCTVxjd1EWwUdDaSfnuWFTrue.kJJ9S',
   'Student', 8, 4, 1, NULL, 'A', 67, '1', 1, 67, 11492, 1, 1, 'CSE', NULL,
   '2026-04-21 13:53:17', '2026-04-21 17:43:49');

INSERT INTO schedule (
  id, college_id, course_id, branch_id, branch_name, year, semester, section,
  day, period_id, subject_id, subject_name, room_number, teacher_id, teacher_name,
  cancelled, cancelled_from, cancelled_to, substitute_teacher_id,
  substitute_teacher_name, substituted_till
) VALUES
  (1, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Monday', 1, 'CST-043', 'Big Data Analytics', 27, 'T_CST043', 'Mrs. Komal Gahtori', 0, NULL, NULL, NULL, NULL, NULL),
  (2, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Monday', 2, 'CET-060', 'Construction Equipment & Automation', 27, 'T_CET060', 'Mr. Ambikesh Yadav', 0, NULL, NULL, NULL, NULL, NULL),
  (3, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Monday', 3, 'AHT-016', 'Project Management & Entrepreneurship', 27, 'T_AHT016', 'Dr. Jagat Pal Singh', 0, NULL, NULL, NULL, NULL, NULL),
  (4, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Monday', 5, 'CSP-020', 'Major Project', 27, 'T_DIVISHT', 'Mr. Divisht Jaiswal', 0, NULL, NULL, NULL, NULL, NULL),
  (5, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Monday', 6, 'CSP-020', 'Major Project', 27, 'T_NARESH', 'Mr. Naresh Tamta', 0, NULL, NULL, NULL, NULL, NULL),
  (6, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Monday', 7, 'CSP-020', 'Major Project', 27, 'T_NARESH', 'Mr. Naresh Tamta', 0, NULL, NULL, NULL, NULL, NULL),
  (7, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Tuesday', 1, 'AHT-016', 'Project Management & Entrepreneurship', 27, 'T_AHT016', 'Dr. Jagat Pal Singh', 0, NULL, NULL, NULL, NULL, NULL),
  (8, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Tuesday', 2, 'CET-060', 'Construction Equipment & Automation', 27, 'T_CET060', 'Mr. Ambikesh Yadav', 0, NULL, NULL, NULL, NULL, NULL),
  (9, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Tuesday', 3, 'MET-046', 'Project Management', 27, 'T_MET046', 'Guest Faculty (ME)', 0, NULL, NULL, NULL, NULL, NULL),
  (10, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Wednesday', 1, 'MET-046', 'Project Management', 27, 'T_MET046', 'Guest Faculty (ME)', 0, NULL, NULL, NULL, NULL, NULL),
  (11, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Wednesday', 2, 'CST-043', 'Big Data Analytics', 27, 'T_CST043', 'Mrs. Komal Gahtori', 0, NULL, NULL, NULL, NULL, NULL),
  (12, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Wednesday', 6, 'CSP-020', 'Major Project', 27, 'T_RISHABH', 'Mr. Rishabh Kushwaha', 0, NULL, NULL, NULL, NULL, NULL),
  (13, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Wednesday', 7, 'CSP-020', 'Major Project', 27, 'T_RISHABH', 'Mr. Rishabh Kushwaha', 0, NULL, NULL, NULL, NULL, NULL),
  (14, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Thursday', 1, 'MET-046', 'Project Management', 27, 'T_MET046', 'Guest Faculty (ME)', 0, NULL, NULL, NULL, NULL, NULL),
  (15, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Thursday', 2, 'CST-043', 'Big Data Analytics', 27, 'T_CST043', 'Mrs. Komal Gahtori', 0, NULL, NULL, NULL, NULL, NULL),
  (16, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Thursday', 6, 'CSP-020', 'Major Project', 27, 'T_DIVISHT', 'Mr. Divisht Jaiswal', 0, NULL, NULL, NULL, NULL, NULL),
  (17, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Thursday', 7, 'CSP-020', 'Major Project', 27, 'T_DIVISHT', 'Mr. Divisht Jaiswal', 0, NULL, NULL, NULL, NULL, NULL),
  (18, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Friday', 2, 'CET-060', 'Construction Equipment & Automation', 27, 'T_CET060', 'Mr. Ambikesh Yadav', 0, NULL, NULL, NULL, NULL, NULL),
  (19, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Friday', 3, 'AHT-016', 'Project Management & Entrepreneurship', 27, 'T_AHT016', 'Dr. Jagat Pal Singh', 1, '2026-04-24 00:05:00', '2026-04-24 23:55:00', 'T_CST043', 'Komal Gahtori', '2026-04-24 23:59:59'),
  (20, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Friday', 5, 'CSP-020', 'Major Project', 27, 'T_DIVISHT', 'Mr. Divisht Jaiswal', 0, NULL, NULL, NULL, NULL, NULL),
  (21, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Friday', 6, 'CSP-020', 'Major Project', 27, 'T_NARESH', 'Mr. Naresh Tamta', 0, NULL, NULL, NULL, NULL, NULL),
  (22, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Friday', 7, 'CSP-020', 'Major Project', 27, 'T_NARESH', 'Mr. Naresh Tamta', 0, NULL, NULL, NULL, NULL, NULL),
  (23, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Saturday', 6, 'CSP-020', 'Major Project', 27, 'T_RISHABH', 'Mr. Rishabh Kushwaha', 0, NULL, NULL, NULL, NULL, NULL),
  (24, 67, '1', 'CSE', 'Computer Science and Engineering', 4, 8, 'A', 'Saturday', 7, 'CSP-020', 'Major Project', 27, 'T_RISHABH', 'Mr. Rishabh Kushwaha', 0, NULL, NULL, NULL, NULL, NULL);

INSERT INTO leaves (
  id, user_id, name, year, branch, student_id, teacher_id, subject, application,
  created_at, applicable_from, applicable_to, status, section, affected_days
) VALUES
  (69, 16, 'Rahul Verma ', 4, 'CSE', '221620101047', 'not a teacher',
   'Leave Application', 'Sick leave ', '2026-04-24 11:12:38',
   '2026-04-23 18:35:00', '2026-04-25 18:25:00', 'Approved', 'A', 'Friday,Saturday'),
  (70, 17, 'Jagat Pal Singh', NULL, NULL, 'not a student', 'T_AHT016',
   'Priviliged', 'Priviliged', '2026-04-24 11:17:58',
   '2026-04-23 18:35:00', '2026-04-24 18:25:00', 'Approved', 'A', 'Friday');

-- Legacy announcements did not store college/course targeting. These records
-- are scoped to the only college/course represented by the legacy student rows.
INSERT INTO announcements (
  id, title, body, created_by, scope, target_college, target_course,
  target_year, target_branch, target_section, status, created_at, updated_at,
  expires_at
) VALUES
  (2, 'Hi', 'Hey', '{"id":"T_AHT016","name":"Jagat Pal Singh"}', 'students', 67, '{"courses":["1"]}', '{"years":["4"]}', '{"branches":["CSE"]}', '{"sections":["A"]}', 'Active', '2026-04-24 10:58:47', '2026-04-24 10:58:47', '2026-04-24 13:00:35'),
  (3, 'hello', 'hiiiii', '{"id":"T_AHT016","name":"Jagat Pal Singh"}', 'students', 67, '{"courses":["1"]}', '{"years":["4"]}', '{"branches":["CSE"]}', '{"sections":["A"]}', 'Active', '2026-04-24 11:02:55', '2026-04-24 11:02:55', '2026-04-24 15:06:00'),
  (4, 'hey', 'dfgdfg', '{"id":"T_AHT016","name":"Jagat Pal Singh"}', 'students', 67, '{"courses":["1"]}', '{"years":["4"]}', '{"branches":["CSE"]}', '{"sections":["all"]}', 'Active', '2026-04-24 11:05:57', '2026-04-24 11:05:57', '2026-04-24 11:10:00'),
  (5, 'o bhaii maro', 'maroooo', '{"id":"T_AHT016","name":"Jagat Pal Singh"}', 'students', 67, '{"courses":["1"]}', '{"years":["4"]}', '{"branches":["CSE"]}', '{"sections":["A"]}', 'Active', '2026-04-24 11:07:04', '2026-04-24 11:07:04', '2026-04-24 11:10:00'),
  (6, 'hi', 'hey', '{"id":"T_AHT016","name":"Jagat Pal Singh"}', 'students', 67, '{"courses":["1"]}', '{"years":["4"]}', '{"branches":["all"]}', '{"sections":["A"]}', 'Active', '2026-04-24 12:40:00', '2026-04-24 12:40:00', '2026-04-24 16:40:00'),
  (7, 'hi', 'hey', '{"id":"T_AHT016","name":"Jagat Pal Singh"}', 'students', 67, '{"courses":["1"]}', '{"years":["4"]}', '{"branches":["all"]}', '{"sections":[]}', 'Active', '2026-04-24 12:40:40', '2026-04-24 12:40:40', '2026-04-24 12:46:00'),
  (8, 'jiii', 'hiiii', '{"id":"T_AHT016","name":"Jagat Pal Singh"}', 'students', 67, '{"courses":["1"]}', '{"years":["all"]}', '{"branches":["CSE"]}', '{"sections":["A"]}', 'Active', '2026-04-24 12:41:01', '2026-04-24 12:41:01', '2026-04-24 12:46:00'),
  (9, 'hi', 'hry', '{"id":"T_AHT016","name":"Jagat Pal Singh"}', 'students', 67, '{"courses":["1"]}', '{"years":["all"]}', '{"branches":["CSE"]}', '{"sections":["all"]}', 'Active', '2026-04-24 12:59:21', '2026-04-24 12:59:21', '2026-04-24 13:05:00'),
  (10, 'Hi', 'Hey', '{"id":"T_AHT016","name":"Jagat Pal "}', 'students', 67, '{"courses":["1"]}', '{"years":["4"]}', '{"branches":["CSE"]}', '{"sections":["A"]}', 'Active', '2026-04-24 13:04:01', '2026-04-24 13:04:01', '2026-04-24 13:15:54');

-- Convert legacy FCM user_id values to the numeric users.id convention used
-- by server2.js and controllers. Device tokens are sensitive: rotate them if
-- this seed file has been shared outside the intended environment.
INSERT INTO fcm_tokens (
  id, user_id, device_name, device_id, fcm_token, active, last_updated
) VALUES
  (19, '13', NULL, 'device-1', 'dtKNDS8YTfaMz0QwkDJIob:APA91bFUc6tDPl3BWdYhvSoB0znKbV10iMUTDYWD9fuZMnCiYzHjyaA6Fv9X-AHi92KNZ9Sf0qGjQRgODTBj4RBZaVSvvi6R-dowm91at2luEPFSgkVE9BU', '1', '2026-04-18 17:10:41'),
  (22, '16', NULL, 'device-1', 'dRvqvPifTiicHps35nuvPz:APA91bEp99oJrs2G9VYSoH3b9FvAt0Y7Iz0Y-e73nX6WKHwszgoOvyHtxzg0-6jRaKpbTx_2PfP5pVmxvHvsTC8uINxp-jzaQ6U_ZTnEni8ROZ-V3Dx6o1Q', '1', '2026-04-24 10:59:13'),
  (25, '15', NULL, 'device-1', 'dRvqvPifTiicHps35nuvPz:APA91bHnEOovq2SQ7589O4qb1qUK8dCzWn0foEoA8assjKctXkLakP0YMlJ36nspVvW_hmipiiQGZBaqxdtfXQQhQt6oIqCKkn5LmiTGwS7nWA58z5hkVYs', '1', '2026-04-24 09:21:11'),
  (112, '17', NULL, 'device-1', 'dRvqvPifTiicHps35nuvPz:APA91bF_4IsV-N-gbvJzCAs6w9nLdDb6hF-zFL_v2an7uNB3Q79DFU-rQfoirUz-T99G2DneTo3kbKWHLbnaLn1i_Yu7bChqf3yIQNjr_JSmyue-70nXuvE', '1', '2026-04-24 10:58:06'),
  (211, '18', NULL, 'device-1', 'elOXNIEdRDi7FyuDHQ8Xxo:APA91bHbPvLQQXn2psoRm5IVK4DCeU1AZsMkXbVjmz7OEr_dbDo1S8AAOaLviZIXfCnvBMGFrKUr6CKxle6CcDBgMuEKTddfbnO3Pbh0JqTlQgpyk8OVZ1M', '1', '2026-04-21 17:44:35'),
  (400, 'og9qtlSeKFax5dEz', NULL, 'device-1', 'dRvqvPifTiicHps35nuvPz:APA91bGSNktmAjBAEJPAnHBpCN_WmSHmNPScng91GgGgjkJtTljCwMR4lhNNpQl76rNYSNwQ-QE4ZpsU2kyEjjtBYkb_hhatg7yTloFheeG2svo2lvqKq2I', '1', '2026-04-24 13:02:30');

ALTER TABLE users AUTO_INCREMENT = 19;
ALTER TABLE schedule AUTO_INCREMENT = 25;
ALTER TABLE leaves AUTO_INCREMENT = 72;
ALTER TABLE announcements AUTO_INCREMENT = 11;
ALTER TABLE fcm_tokens AUTO_INCREMENT = 402;
