CREATE DATABASE  IF NOT EXISTS `scheduler` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `scheduler`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: scheduler
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `created_by` json DEFAULT NULL,
  `scope` varchar(16) NOT NULL DEFAULT 'students',
  `target_college` int unsigned DEFAULT NULL,
  `target_course` json DEFAULT NULL,
  `target_year` json DEFAULT NULL,
  `target_branch` json DEFAULT NULL,
  `target_section` json DEFAULT NULL,
  `status` varchar(12) DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_announcements_target_expiry` (`target_college`,`status`,`expires_at`),
  KEY `idx_announcements_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (2,'Hi','Hey','{\"id\": \"T_AHT016\", \"name\": \"Jagat Pal Singh\"}','students',67,'{\"courses\": [\"1\"]}','{\"years\": [\"4\"]}','{\"branches\": [\"CSE\"]}','{\"sections\": [\"A\"]}','Expired','2026-04-24 17:58:47','2026-10-25 15:44:11','2026-04-24 20:00:35'),(3,'hello','hiiiii','{\"id\": \"T_AHT016\", \"name\": \"Jagat Pal Singh\"}','students',67,'{\"courses\": [\"1\"]}','{\"years\": [\"4\"]}','{\"branches\": [\"CSE\"]}','{\"sections\": [\"A\"]}','Expired','2026-04-24 18:02:55','2026-10-25 15:44:11','2026-04-24 22:06:00'),(4,'hey','dfgdfg','{\"id\": \"T_AHT016\", \"name\": \"Jagat Pal Singh\"}','students',67,'{\"courses\": [\"1\"]}','{\"years\": [\"4\"]}','{\"branches\": [\"CSE\"]}','{\"sections\": [\"all\"]}','Expired','2026-04-24 18:05:57','2026-10-25 15:44:11','2026-04-24 18:10:00'),(5,'o bhaii maro','maroooo','{\"id\": \"T_AHT016\", \"name\": \"Jagat Pal Singh\"}','students',67,'{\"courses\": [\"1\"]}','{\"years\": [\"4\"]}','{\"branches\": [\"CSE\"]}','{\"sections\": [\"A\"]}','Expired','2026-04-24 18:07:04','2026-10-25 15:44:11','2026-04-24 18:10:00'),(6,'hi','hey','{\"id\": \"T_AHT016\", \"name\": \"Jagat Pal Singh\"}','students',67,'{\"courses\": [\"1\"]}','{\"years\": [\"4\"]}','{\"branches\": [\"all\"]}','{\"sections\": [\"A\"]}','Expired','2026-04-24 19:40:00','2026-10-25 15:44:11','2026-04-24 23:40:00'),(7,'hi','hey','{\"id\": \"T_AHT016\", \"name\": \"Jagat Pal Singh\"}','students',67,'{\"courses\": [\"1\"]}','{\"years\": [\"4\"]}','{\"branches\": [\"all\"]}','{\"sections\": []}','Expired','2026-04-24 19:40:40','2026-10-25 15:44:11','2026-04-24 19:46:00'),(8,'jiii','hiiii','{\"id\": \"T_AHT016\", \"name\": \"Jagat Pal Singh\"}','students',67,'{\"courses\": [\"1\"]}','{\"years\": [\"all\"]}','{\"branches\": [\"CSE\"]}','{\"sections\": [\"A\"]}','Expired','2026-04-24 19:41:01','2026-10-25 15:44:11','2026-04-24 19:46:00'),(9,'hi','hry','{\"id\": \"T_AHT016\", \"name\": \"Jagat Pal Singh\"}','students',67,'{\"courses\": [\"1\"]}','{\"years\": [\"all\"]}','{\"branches\": [\"CSE\"]}','{\"sections\": [\"all\"]}','Expired','2026-04-24 19:59:21','2026-10-25 15:44:11','2026-04-24 20:05:00'),(10,'Hi','Hey','{\"id\": \"T_AHT016\", \"name\": \"Jagat Pal \"}','students',67,'{\"courses\": [\"1\"]}','{\"years\": [\"4\"]}','{\"branches\": [\"CSE\"]}','{\"sections\": [\"A\"]}','Expired','2026-04-24 20:04:01','2026-10-25 15:44:11','2026-04-24 20:15:54');
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `branch_name` varchar(255) NOT NULL,
  `branch_id` varchar(12) NOT NULL,
  `course_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_branches_code` (`branch_id`),
  KEY `fk_branches_course` (`course_id`),
  CONSTRAINT `fk_branches_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES (1,'Computer Science & Engineering','CSE',1);
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colleges`
--

DROP TABLE IF EXISTS `colleges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colleges` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `college_id` varchar(16) DEFAULT NULL,
  `college_name` varchar(255) NOT NULL,
  `university` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_colleges_name` (`college_name`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colleges`
--

LOCK TABLES `colleges` WRITE;
/*!40000 ALTER TABLE `colleges` DISABLE KEYS */;
INSERT INTO `colleges` VALUES (67,'AKIT201620262036','Dr. A.P.J Abdul Kalam Institute of Technology','Uttarakhand Technical University');
/*!40000 ALTER TABLE `colleges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `college_id` int unsigned NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `course_id` varchar(32) NOT NULL,
  `total_semesters` tinyint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_courses_college` (`college_id`),
  KEY `idx_courses_code` (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,67,'Bachelor of Technology','B.Tech',8);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fcm_tokens`
--

DROP TABLE IF EXISTS `fcm_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fcm_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) NOT NULL,
  `device_name` varchar(50) DEFAULT NULL,
  `device_id` varchar(50) DEFAULT NULL,
  `fcm_token` varchar(512) NOT NULL,
  `active` enum('0','1') DEFAULT '1',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_fcm_user_device` (`user_id`,`device_id`),
  KEY `idx_fcm_user` (`user_id`),
  KEY `idx_fcm_token` (`fcm_token`)
) ENGINE=InnoDB AUTO_INCREMENT=428 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fcm_tokens`
--

LOCK TABLES `fcm_tokens` WRITE;
/*!40000 ALTER TABLE `fcm_tokens` DISABLE KEYS */;
INSERT INTO `fcm_tokens` VALUES (19,'13',NULL,'device-1','dtKNDS8YTfaMz0QwkDJIob:APA91bFUc6tDPl3BWdYhvSoB0znKbV10iMUTDYWD9fuZMnCiYzHjyaA6Fv9X-AHi92KNZ9Sf0qGjQRgODTBj4RBZaVSvvi6R-dowm91at2luEPFSgkVE9BU','1','2026-04-19 00:10:41'),(22,'16',NULL,'device-1','dRvqvPifTiicHps35nuvPz:APA91bEp99oJrs2G9VYSoH3b9FvAt0Y7Iz0Y-e73nX6WKHwszgoOvyHtxzg0-6jRaKpbTx_2PfP5pVmxvHvsTC8uINxp-jzaQ6U_ZTnEni8ROZ-V3Dx6o1Q','1','2026-04-24 17:59:13'),(25,'15',NULL,'device-1','dRvqvPifTiicHps35nuvPz:APA91bHnEOovq2SQ7589O4qb1qUK8dCzWn0foEoA8assjKctXkLakP0YMlJ36nspVvW_hmipiiQGZBaqxdtfXQQhQt6oIqCKkn5LmiTGwS7nWA58z5hkVYs','1','2026-04-24 16:21:11'),(112,'17',NULL,'device-1','dRvqvPifTiicHps35nuvPz:APA91bF_4IsV-N-gbvJzCAs6w9nLdDb6hF-zFL_v2an7uNB3Q79DFU-rQfoirUz-T99G2DneTo3kbKWHLbnaLn1i_Yu7bChqf3yIQNjr_JSmyue-70nXuvE','1','2026-04-24 17:58:06'),(211,'18',NULL,'device-1','elOXNIEdRDi7FyuDHQ8Xxo:APA91bHbPvLQQXn2psoRm5IVK4DCeU1AZsMkXbVjmz7OEr_dbDo1S8AAOaLviZIXfCnvBMGFrKUr6CKxle6CcDBgMuEKTddfbnO3Pbh0JqTlQgpyk8OVZ1M','1','2026-04-22 00:44:35'),(400,'og9qtlSeKFax5dEz',NULL,'device-1','dRvqvPifTiicHps35nuvPz:APA91bGSNktmAjBAEJPAnHBpCN_WmSHmNPScng91GgGgjkJtTljCwMR4lhNNpQl76rNYSNwQ-QE4ZpsU2kyEjjtBYkb_hhatg7yTloFheeG2svo2lvqKq2I','1','2026-04-24 20:02:30'),(410,'16','device-1',NULL,'cMFuI_6urCTvkwAsaYgVnO:APA91bGO3gbran8ErStJdU1AWzHEmOE4Iy996zgYkSvY6yHjA3ABFXJcCuHAdqWagm9_8PgVs-UBfv_hRhCQsvnTEdW-VU3Qi4v7uEHKs0crh-T0h8uU7xo','1','2026-10-25 16:07:34'),(411,'16','device-1',NULL,'cMFuI_6urCTvkwAsaYgVnO:APA91bGgy5RZ97sb2l8f1VrsLYKOi9Jz5Y1unE8EoJW_RF7SsW00MetuYt_BDd54OJznQqdbHmVBRM44CQv9FnMJ6DKiUnVpwLEgEmuqIvzUO2NHe0iTKfU','1','2026-10-26 14:27:09'),(417,'15','device-1',NULL,'cMFuI_6urCTvkwAsaYgVnO:APA91bGkDdh41Yam4H80CVc8JgMVWWgtepyrRJmmsioEZOqhlzGq7JHRyprHEL2swFM9IoSANtGbpZo4K_H-KbXZz2q-2J6fkDmk7VvnJ4AzGE0B7I-BatA','1','2026-10-26 16:06:47'),(418,'15','device-1',NULL,'cMFuI_6urCTvkwAsaYgVnO:APA91bGkDdh41Yam4H80CVc8JgMVWWgtepyrRJmmsioEZOqhlzGq7JHRyprHEL2swFM9IoSANtGbpZo4K_H-KbXZz2q-2J6fkDmk7VvnJ4AzGE0B7I-BatA','1','2026-10-26 16:08:48'),(419,'15','device-1',NULL,'cMFuI_6urCTvkwAsaYgVnO:APA91bGkDdh41Yam4H80CVc8JgMVWWgtepyrRJmmsioEZOqhlzGq7JHRyprHEL2swFM9IoSANtGbpZo4K_H-KbXZz2q-2J6fkDmk7VvnJ4AzGE0B7I-BatA','1','2026-10-26 16:15:16'),(420,'15','device-1',NULL,'cMFuI_6urCTvkwAsaYgVnO:APA91bGkDdh41Yam4H80CVc8JgMVWWgtepyrRJmmsioEZOqhlzGq7JHRyprHEL2swFM9IoSANtGbpZo4K_H-KbXZz2q-2J6fkDmk7VvnJ4AzGE0B7I-BatA','1','2026-10-26 16:15:57'),(421,'15','device-1',NULL,'cMFuI_6urCTvkwAsaYgVnO:APA91bGkDdh41Yam4H80CVc8JgMVWWgtepyrRJmmsioEZOqhlzGq7JHRyprHEL2swFM9IoSANtGbpZo4K_H-KbXZz2q-2J6fkDmk7VvnJ4AzGE0B7I-BatA','1','2026-10-26 16:19:12'),(422,'15','device-1',NULL,'cMFuI_6urCTvkwAsaYgVnO:APA91bGkDdh41Yam4H80CVc8JgMVWWgtepyrRJmmsioEZOqhlzGq7JHRyprHEL2swFM9IoSANtGbpZo4K_H-KbXZz2q-2J6fkDmk7VvnJ4AzGE0B7I-BatA','1','2026-10-26 16:20:43'),(423,'15','device-1',NULL,'cMFuI_6urCTvkwAsaYgVnO:APA91bGkDdh41Yam4H80CVc8JgMVWWgtepyrRJmmsioEZOqhlzGq7JHRyprHEL2swFM9IoSANtGbpZo4K_H-KbXZz2q-2J6fkDmk7VvnJ4AzGE0B7I-BatA','1','2026-10-26 16:23:23'),(424,'15','device-1',NULL,'cMFuI_6urCTvkwAsaYgVnO:APA91bGkDdh41Yam4H80CVc8JgMVWWgtepyrRJmmsioEZOqhlzGq7JHRyprHEL2swFM9IoSANtGbpZo4K_H-KbXZz2q-2J6fkDmk7VvnJ4AzGE0B7I-BatA','1','2026-10-26 16:29:03'),(425,'15','device-1',NULL,'cMFuI_6urCTvkwAsaYgVnO:APA91bGkDdh41Yam4H80CVc8JgMVWWgtepyrRJmmsioEZOqhlzGq7JHRyprHEL2swFM9IoSANtGbpZo4K_H-KbXZz2q-2J6fkDmk7VvnJ4AzGE0B7I-BatA','1','2026-10-26 16:32:11'),(426,'15','device-1',NULL,'cMFuI_6urCTvkwAsaYgVnO:APA91bGkDdh41Yam4H80CVc8JgMVWWgtepyrRJmmsioEZOqhlzGq7JHRyprHEL2swFM9IoSANtGbpZo4K_H-KbXZz2q-2J6fkDmk7VvnJ4AzGE0B7I-BatA','1','2026-10-26 16:32:12'),(427,'15','device-1',NULL,'cMFuI_6urCTvkwAsaYgVnO:APA91bGkDdh41Yam4H80CVc8JgMVWWgtepyrRJmmsioEZOqhlzGq7JHRyprHEL2swFM9IoSANtGbpZo4K_H-KbXZz2q-2J6fkDmk7VvnJ4AzGE0B7I-BatA','1','2026-10-26 16:35:35');
/*!40000 ALTER TABLE `fcm_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaves`
--

DROP TABLE IF EXISTS `leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaves` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `year` int DEFAULT NULL,
  `branch` varchar(50) DEFAULT NULL,
  `student_id` varchar(32) DEFAULT NULL,
  `teacher_id` varchar(32) DEFAULT NULL,
  `subject` varchar(512) DEFAULT NULL,
  `application` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `applicable_from` timestamp NOT NULL,
  `applicable_to` timestamp NOT NULL,
  `status` varchar(12) NOT NULL,
  `section` char(1) DEFAULT 'A',
  `affected_days` set('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_leaves_user_created` (`user_id`,`created_at`),
  KEY `idx_leaves_student_dates` (`student_id`,`applicable_from`,`applicable_to`),
  KEY `idx_leaves_teacher_dates` (`teacher_id`,`applicable_from`,`applicable_to`),
  KEY `idx_leaves_dates_status` (`applicable_to`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaves`
--

LOCK TABLES `leaves` WRITE;
/*!40000 ALTER TABLE `leaves` DISABLE KEYS */;
INSERT INTO `leaves` VALUES (69,16,'Rahul Verma ',4,'CSE','221620101047','not a teacher','Leave Application','Sick leave ','2026-04-24 18:12:38','2026-04-24 01:35:00','2026-04-26 01:25:00','Approved','A','Friday,Saturday'),(70,17,'Jagat Pal Singh',NULL,NULL,'not a student','T_AHT016','Priviliged','Priviliged','2026-04-24 18:17:58','2026-04-24 01:35:00','2026-04-25 01:25:00','Approved','A','Friday');
/*!40000 ALTER TABLE `leaves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule`
--

DROP TABLE IF EXISTS `schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `college_id` int unsigned DEFAULT NULL,
  `course_id` varchar(32) DEFAULT NULL,
  `branch_id` varchar(12) NOT NULL,
  `branch_name` varchar(50) NOT NULL,
  `year` int NOT NULL,
  `semester` tinyint NOT NULL,
  `section` char(1) NOT NULL DEFAULT 'A',
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `period_id` int NOT NULL,
  `subject_id` varchar(16) NOT NULL,
  `subject_name` varchar(120) NOT NULL,
  `room_number` int DEFAULT NULL,
  `teacher_id` varchar(32) DEFAULT NULL,
  `teacher_name` varchar(64) DEFAULT NULL,
  `cancelled` tinyint(1) NOT NULL DEFAULT '0',
  `cancelled_from` datetime DEFAULT NULL,
  `cancelled_to` datetime DEFAULT NULL,
  `substitute_teacher_id` varchar(32) DEFAULT NULL,
  `substitute_teacher_name` varchar(64) DEFAULT NULL,
  `substituted_till` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_schedule_student` (`college_id`,`course_id`,`year`,`branch_id`,`section`,`day`,`period_id`),
  KEY `idx_schedule_teacher` (`college_id`,`teacher_id`,`day`,`period_id`),
  KEY `idx_schedule_branch_year_section` (`branch_id`,`year`,`section`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
INSERT INTO `schedule` VALUES (1,67,'1','CSE','Computer Science and Engineering',4,8,'A','Monday',1,'CST-043','Big Data Analytics',27,'T_CST043','Mrs. Komal Gahtori',0,NULL,NULL,NULL,NULL,NULL),(2,67,'1','CSE','Computer Science and Engineering',4,8,'A','Monday',2,'CET-060','Construction Equipment & Automation',27,'T_CET060','Mr. Ambikesh Yadav',0,NULL,NULL,NULL,NULL,NULL),(3,67,'1','CSE','Computer Science and Engineering',4,8,'A','Monday',3,'AHT-016','Project Management & Entrepreneurship',27,'T_AHT016','Dr. Jagat Pal Singh',0,NULL,NULL,NULL,NULL,NULL),(4,67,'1','CSE','Computer Science and Engineering',4,8,'A','Monday',5,'CSP-020','Major Project',27,'T_DIVISHT','Mr. Divisht Jaiswal',0,NULL,NULL,NULL,NULL,NULL),(5,67,'1','CSE','Computer Science and Engineering',4,8,'A','Monday',6,'CSP-020','Major Project',27,'T_NARESH','Mr. Naresh Tamta',0,NULL,NULL,NULL,NULL,NULL),(6,67,'1','CSE','Computer Science and Engineering',4,8,'A','Monday',7,'CSP-020','Major Project',27,'T_NARESH','Mr. Naresh Tamta',0,NULL,NULL,NULL,NULL,NULL),(7,67,'1','CSE','Computer Science and Engineering',4,8,'A','Tuesday',1,'AHT-016','Project Management & Entrepreneurship',27,'T_AHT016','Dr. Jagat Pal Singh',0,NULL,NULL,NULL,NULL,NULL),(8,67,'1','CSE','Computer Science and Engineering',4,8,'A','Tuesday',2,'CET-060','Construction Equipment & Automation',27,'T_CET060','Mr. Ambikesh Yadav',0,NULL,NULL,NULL,NULL,NULL),(9,67,'1','CSE','Computer Science and Engineering',4,8,'A','Tuesday',3,'MET-046','Project Management',27,'T_MET046','Guest Faculty (ME)',0,NULL,NULL,NULL,NULL,NULL),(10,67,'1','CSE','Computer Science and Engineering',4,8,'A','Wednesday',1,'MET-046','Project Management',27,'T_MET046','Guest Faculty (ME)',0,NULL,NULL,NULL,NULL,NULL),(11,67,'1','CSE','Computer Science and Engineering',4,8,'A','Wednesday',2,'CST-043','Big Data Analytics',27,'T_CST043','Mrs. Komal Gahtori',0,NULL,NULL,NULL,NULL,NULL),(12,67,'1','CSE','Computer Science and Engineering',4,8,'A','Wednesday',6,'CSP-020','Major Project',27,'T_RISHABH','Mr. Rishabh Kushwaha',0,NULL,NULL,NULL,NULL,NULL),(13,67,'1','CSE','Computer Science and Engineering',4,8,'A','Wednesday',7,'CSP-020','Major Project',27,'T_RISHABH','Mr. Rishabh Kushwaha',0,NULL,NULL,NULL,NULL,NULL),(14,67,'1','CSE','Computer Science and Engineering',4,8,'A','Thursday',1,'MET-046','Project Management',27,'T_MET046','Guest Faculty (ME)',0,NULL,NULL,NULL,NULL,NULL),(15,67,'1','CSE','Computer Science and Engineering',4,8,'A','Thursday',2,'CST-043','Big Data Analytics',27,'T_CST043','Mrs. Komal Gahtori',0,NULL,NULL,NULL,NULL,NULL),(16,67,'1','CSE','Computer Science and Engineering',4,8,'A','Thursday',6,'CSP-020','Major Project',27,'T_DIVISHT','Mr. Divisht Jaiswal',0,NULL,NULL,NULL,NULL,NULL),(17,67,'1','CSE','Computer Science and Engineering',4,8,'A','Thursday',7,'CSP-020','Major Project',27,'T_DIVISHT','Mr. Divisht Jaiswal',0,NULL,NULL,NULL,NULL,NULL),(18,67,'1','CSE','Computer Science and Engineering',4,8,'A','Friday',2,'CET-060','Construction Equipment & Automation',27,'T_CET060','Mr. Ambikesh Yadav',0,NULL,NULL,NULL,NULL,NULL),(19,67,'1','CSE','Computer Science and Engineering',4,8,'A','Friday',3,'AHT-016','Project Management & Entrepreneurship',27,'T_AHT016','Dr. Jagat Pal Singh',1,'2026-04-24 00:05:00','2026-04-24 23:55:00','T_CST043','Komal Gahtori','2026-04-24 23:59:59'),(20,67,'1','CSE','Computer Science and Engineering',4,8,'A','Friday',5,'CSP-020','Major Project',27,'T_DIVISHT','Mr. Divisht Jaiswal',0,NULL,NULL,NULL,NULL,NULL),(21,67,'1','CSE','Computer Science and Engineering',4,8,'A','Friday',6,'CSP-020','Major Project',27,'T_NARESH','Mr. Naresh Tamta',0,NULL,NULL,NULL,NULL,NULL),(22,67,'1','CSE','Computer Science and Engineering',4,8,'A','Friday',7,'CSP-020','Major Project',27,'T_NARESH','Mr. Naresh Tamta',0,NULL,NULL,NULL,NULL,NULL),(23,67,'1','CSE','Computer Science and Engineering',4,8,'A','Saturday',6,'CSP-020','Major Project',27,'T_RISHABH','Mr. Rishabh Kushwaha',0,NULL,NULL,NULL,NULL,NULL),(24,67,'1','CSE','Computer Science and Engineering',4,8,'A','Saturday',7,'CSP-020','Major Project',27,'T_RISHABH','Mr. Rishabh Kushwaha',0,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) DEFAULT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `teacher_id` varchar(32) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` char(60) NOT NULL,
  `role` enum('Student','Teacher','Admin','HOD','Director') NOT NULL DEFAULT 'Student',
  `semester` tinyint unsigned DEFAULT NULL,
  `year` tinyint unsigned DEFAULT NULL,
  `start_month` tinyint unsigned DEFAULT NULL,
  `otp` json DEFAULT NULL,
  `section` char(1) DEFAULT 'A',
  `college_id` int unsigned DEFAULT NULL,
  `course_id` varchar(32) DEFAULT NULL,
  `token_version` int unsigned NOT NULL DEFAULT '1',
  `collegeId` int unsigned DEFAULT NULL,
  `admissionId` int unsigned DEFAULT NULL,
  `courseId` int unsigned DEFAULT NULL,
  `branchId` int unsigned DEFAULT NULL,
  `branch_id` varchar(12) DEFAULT NULL,
  `branch_name` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_user_id` (`user_id`),
  KEY `idx_users_student_id` (`student_id`),
  KEY `idx_users_teacher_id` (`teacher_id`),
  KEY `idx_users_college_course` (`college_id`,`course_id`,`branch_id`,`year`,`section`),
  KEY `idx_users_legacy_branch_semester` (`branchId`,`semester`,`section`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (13,'Gz4xcW1P9vYFnLHk',NULL,'T_RISHABH','Rishabh Kushwaha ','rishabh.1988@gmail.com','$2b$10$KGR0Lp12nCD2ONMEAVRzSulxwBMG3grRTZjNSv9YWtY/U4hEQRrkq','Teacher',NULL,NULL,NULL,NULL,'A',67,'1',1,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-17 05:07:02','2026-04-17 17:47:00'),(15,'cKCu4uJ8HD0nBe4g',NULL,'T_CST043','Komal Gahtori','komal@gmail.com','$2b$10$jsJ4xFwxLkIYfYYrT6i/xeXNwBH8DN89ka5VjUS/Mh67XqyGBAImG','Teacher',NULL,NULL,NULL,NULL,'A',67,'1',1,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-17 17:55:25','2026-04-17 17:55:25'),(16,'hgY0XIWirbeWcIdo','221620101047',NULL,'Rahul Verma ','rahulverma.1.2005@gmail.com','$2b$10$9rUfNNmmSQfYgMIwHl45xeipXi/W3nDiRz2VzJ1zURKjcOHXRCVAm','Student',8,4,1,NULL,'A',67,'1',1,67,11492,1,1,'CSE',NULL,'2026-04-17 21:14:45','2026-04-23 23:14:46'),(17,'IryIbIJy06eYRh82',NULL,'T_AHT016','Jagat Pal Singh','jagat@gmail.com','$2b$10$4CCccMwku.ogRMbRgC/n8ODZlJoDy.wgnoYu1iv0EL7aybnNvWUli','Teacher',NULL,NULL,NULL,NULL,'A',67,'1',1,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-17 22:33:59','2026-04-24 02:10:27'),(18,'1BAm16e2wFZl4ir9','221620101047',NULL,'Anu Verma','anu@gmail.com','$2b$10$vzNt3VIz3bprXmXDJTp2TuWCTVxjd1EWwUdDaSfnuWFTrue.kJJ9S','Student',8,4,1,NULL,'A',67,'1',1,67,11492,1,1,'CSE',NULL,'2026-04-21 20:53:17','2026-04-22 00:43:49');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-26 22:25:17
