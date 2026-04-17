-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: scheduler
-- ------------------------------------------------------
-- Server version	8.0.39

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

USE bw29rwejnmb7a0ihv8ip;

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `created_by` json DEFAULT NULL,
  `target_year` json DEFAULT NULL,
  `target_branch` json DEFAULT NULL,
  `target_section` json DEFAULT NULL,
  `status` varchar(12) DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `delete_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (118,'Hello','Hi','{\"id\": \"T_RISHABH\", \"name\": \"Rishabh Kushwaha \"}','{\"years\": [\"4\"]}','{\"branches\": [\"CSE\"]}','{\"sections\": [\"A\"]}','Active','2026-04-17 14:41:11','2026-04-17 14:41:11','2026-04-17 21:15:00');
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
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
  `fcm_token` varchar(255) NOT NULL,
  `active` enum('0','1') DEFAULT '1',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_device` (`user_id`,`device_id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fcm_tokens`
--

LOCK TABLES `fcm_tokens` WRITE;
/*!40000 ALTER TABLE `fcm_tokens` DISABLE KEYS */;
INSERT INTO `fcm_tokens` VALUES (19,'Gz4xcW1P9vYFnLHk',NULL,'device-1','dtKNDS8YTfaMz0QwkDJIob:APA91bGvNrrMlz38JMkVisBg6OITTB4bV2Kh2gxPuhBydFKlOgVbbfetrTSGr-P1h0-Gwv7g5YH37RcprcUhKRdxrSpTcQGq2EVfK1JJDYoaI8rYVuhBBdc','1','2026-04-17 14:40:51'),(22,'hgY0XIWirbeWcIdo',NULL,'device-1','dtKNDS8YTfaMz0QwkDJIob:APA91bEKl9K8Lk4BNxGjsuGUeykaarwtg0PTzVxnSOrhc0bwKC78dJ7c42_fnaxc2NPAaJfGlSo6AeybpmBdEQNU-3cxBdKDZbz-Bmeyh-0FWS4MZ0JzTjs','1','2026-04-17 14:49:49'),(25,'cKCu4uJ8HD0nBe4g',NULL,'device-1','dtKNDS8YTfaMz0QwkDJIob:APA91bGysJg7nuHRlhr9GTfzbjVBBH2kWDlRf5_d1cgQy8lZm2Y6J4If1DmgdZSAmNI6H8MlAcadMhOHmUo1LzipMu0OpSfZx9bF3knAlkW_zzKeU71zMLg','1','2026-04-17 13:13:00');
/*!40000 ALTER TABLE `fcm_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaves`
--

DROP TABLE IF EXISTS `leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaves` (
  `name` varchar(100) NOT NULL,
  `year` int DEFAULT NULL,
  `branch` varchar(50) DEFAULT NULL,
  `student_id` varchar(32) NOT NULL DEFAULT 'not a student',
  `teacher_id` varchar(32) NOT NULL DEFAULT 'not a teacher',
  `subject` varchar(512) DEFAULT NULL,
  `application` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `applicable_from` timestamp NOT NULL,
  `applicable_to` timestamp NOT NULL,
  `status` varchar(12) NOT NULL,
  `section` char(1) NOT NULL DEFAULT 'A',
  `affected_days` set('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_leave` (`student_id`,`teacher_id`,`applicable_from`,`applicable_to`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaves`
--

LOCK TABLES `leaves` WRITE;
/*!40000 ALTER TABLE `leaves` DISABLE KEYS */;
INSERT INTO `leaves` VALUES ('Rahul Verma ',4,'CSE','221620101047','not a teacher','Leave Application','Sick leave ','2026-04-17 14:17:36','2026-04-17 08:47:00','2026-04-22 08:47:00','Approved','A','Monday,Tuesday,Wednesday,Friday,Saturday,Sunday',7),('Rishabh Kushwaha ',NULL,NULL,'not a student','T_RISHABH','Priviliged','Priviliged','2026-04-17 14:40:13','2026-04-17 09:10:00','2026-04-22 09:10:00','Approved','A','Monday,Tuesday,Wednesday,Friday,Saturday,Sunday',8);
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
  `branch_id` varchar(8) NOT NULL,
  `branch_name` varchar(50) NOT NULL,
  `year` int NOT NULL,
  `semester` tinyint NOT NULL,
  `section` char(1) NOT NULL DEFAULT 'A',
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `period_id` int NOT NULL,
  `subject_id` varchar(8) NOT NULL,
  `subject_name` varchar(120) NOT NULL,
  `room_number` int DEFAULT NULL,
  `teacher_id` varchar(32) DEFAULT NULL,
  `teacher_name` varchar(64) DEFAULT NULL,
  `cancelled` tinyint(1) DEFAULT '0',
  `cancelled_from` datetime DEFAULT NULL,
  `cancelled_to` datetime DEFAULT NULL,
  `substitute_teacher_id` varchar(32) DEFAULT NULL,
  `substitute_teacher_name` varchar(64) DEFAULT NULL,
  `substituted_till` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
INSERT INTO `schedule` VALUES (1,'CSE','Computer Science and Engineering',4,8,'A','Monday',1,'CST-043','Big Data Analytics',27,'T_CST043','Mrs. Komal Gahtori',0,NULL,NULL,NULL,NULL,NULL),(2,'CSE','Computer Science and Engineering',4,8,'A','Monday',2,'CET-060','Construction Equipment & Automation',27,'T_CET060','Mr. Ambikesh Yadav',0,NULL,NULL,NULL,NULL,NULL),(3,'CSE','Computer Science and Engineering',4,8,'A','Monday',3,'AHT-016','Project Management & Entrepreneurship',27,'T_AHT016','Dr. Jagat Pal Singh',0,NULL,NULL,NULL,NULL,NULL),(4,'CSE','Computer Science and Engineering',4,8,'A','Monday',5,'CSP-020','Major Project',27,'T_DIVISHT','Mr. Divisht Jaiswal',0,NULL,NULL,NULL,NULL,NULL),(5,'CSE','Computer Science and Engineering',4,8,'A','Monday',6,'CSP-020','Major Project',27,'T_NARESH','Mr. Naresh Tamta',0,NULL,NULL,NULL,NULL,NULL),(6,'CSE','Computer Science and Engineering',4,8,'A','Monday',7,'CSP-020','Major Project',27,'T_NARESH','Mr. Naresh Tamta',0,NULL,NULL,NULL,NULL,NULL),(7,'CSE','Computer Science and Engineering',4,8,'A','Tuesday',1,'AHT-016','Project Management & Entrepreneurship',27,'T_AHT016','Dr. Jagat Pal Singh',0,NULL,NULL,NULL,NULL,NULL),(8,'CSE','Computer Science and Engineering',4,8,'A','Tuesday',2,'CET-060','Construction Equipment & Automation',27,'T_CET060','Mr. Ambikesh Yadav',0,NULL,NULL,NULL,NULL,NULL),(9,'CSE','Computer Science and Engineering',4,8,'A','Tuesday',3,'MET-046','Project Management',27,'T_MET046','Guest Faculty (ME)',0,NULL,NULL,NULL,NULL,NULL),(10,'CSE','Computer Science and Engineering',4,8,'A','Wednesday',1,'MET-046','Project Management',27,'T_MET046','Guest Faculty (ME)',0,NULL,NULL,NULL,NULL,NULL),(11,'CSE','Computer Science and Engineering',4,8,'A','Wednesday',2,'CST-043','Big Data Analytics',27,'T_CST043','Mrs. Komal Gahtori',0,NULL,NULL,NULL,NULL,NULL),(12,'CSE','Computer Science and Engineering',4,8,'A','Wednesday',6,'CSP-020','Major Project',27,'T_RISHABH','Mr. Rishabh Kushwaha',1,'2026-04-17 14:40:00','2026-04-22 14:40:00',NULL,NULL,NULL),(13,'CSE','Computer Science and Engineering',4,8,'A','Wednesday',7,'CSP-020','Major Project',27,'T_RISHABH','Mr. Rishabh Kushwaha',1,'2026-04-17 14:40:00','2026-04-22 14:40:00',NULL,NULL,NULL),(14,'CSE','Computer Science and Engineering',4,8,'A','Thursday',1,'MET-046','Project Management',27,'T_MET046','Guest Faculty (ME)',0,NULL,NULL,NULL,NULL,NULL),(15,'CSE','Computer Science and Engineering',4,8,'A','Thursday',2,'CST-043','Big Data Analytics',27,'T_CST043','Mrs. Komal Gahtori',0,NULL,NULL,NULL,NULL,NULL),(16,'CSE','Computer Science and Engineering',4,8,'A','Thursday',6,'CSP-020','Major Project',27,'T_DIVISHT','Mr. Divisht Jaiswal',0,NULL,NULL,NULL,NULL,NULL),(17,'CSE','Computer Science and Engineering',4,8,'A','Thursday',7,'CSP-020','Major Project',27,'T_DIVISHT','Mr. Divisht Jaiswal',0,NULL,NULL,NULL,NULL,NULL),(18,'CSE','Computer Science and Engineering',4,8,'A','Friday',2,'CET-060','Construction Equipment & Automation',27,'T_CET060','Mr. Ambikesh Yadav',0,NULL,NULL,NULL,NULL,NULL),(19,'CSE','Computer Science and Engineering',4,8,'A','Friday',3,'AHT-016','Project Management & Entrepreneurship',27,'T_AHT016','Dr. Jagat Pal Singh',0,NULL,NULL,NULL,NULL,NULL),(20,'CSE','Computer Science and Engineering',4,8,'A','Friday',5,'CSP-020','Major Project',27,'T_DIVISHT','Mr. Divisht Jaiswal',0,NULL,NULL,NULL,NULL,NULL),(21,'CSE','Computer Science and Engineering',4,8,'A','Friday',6,'CSP-020','Major Project',27,'T_NARESH','Mr. Naresh Tamta',0,NULL,NULL,NULL,NULL,NULL),(22,'CSE','Computer Science and Engineering',4,8,'A','Friday',7,'CSP-020','Major Project',27,'T_NARESH','Mr. Naresh Tamta',0,NULL,NULL,NULL,NULL,NULL),(23,'CSE','Computer Science and Engineering',4,8,'A','Saturday',6,'CSP-020','Major Project',27,'T_RISHABH','Mr. Rishabh Kushwaha',1,'2026-04-17 14:40:00','2026-04-22 14:40:00',NULL,NULL,NULL),(24,'CSE','Computer Science and Engineering',4,8,'A','Saturday',7,'CSP-020','Major Project',27,'T_RISHABH','Mr. Rishabh Kushwaha',1,'2026-04-17 14:40:00','2026-04-22 14:40:00',NULL,NULL,NULL);
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
  `user_id` varchar(20) NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `teacher_id` varchar(32) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` char(60) NOT NULL,
  `role` enum('Student','Teacher','Admin') NOT NULL DEFAULT 'Student',
  `semester` tinyint unsigned DEFAULT NULL,
  `year` tinyint unsigned DEFAULT NULL,
  `start_month` tinyint unsigned DEFAULT NULL,
  `otp` json DEFAULT NULL,
  `section` char(1) DEFAULT 'A',
  `collegeId` int unsigned DEFAULT NULL,
  `admissionId` int unsigned DEFAULT NULL,
  `courseId` int unsigned DEFAULT NULL,
  `branchId` int unsigned DEFAULT NULL,
  `branch_id` varchar(12) DEFAULT NULL,
  `branch_name` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `unique_user_id` (`user_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_branch_sem` (`branchId`,`semester`,`section`),
  KEY `idx_college` (`collegeId`),
  KEY `idx_course` (`courseId`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (13,'Gz4xcW1P9vYFnLHk',NULL,'T_RISHABH','Rishabh Kushwaha ','rishabh.1988@gmail.com','$2b$10$KGR0Lp12nCD2ONMEAVRzSulxwBMG3grRTZjNSv9YWtY/U4hEQRrkq','Teacher',NULL,NULL,NULL,NULL,'A',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-16 22:07:02','2026-04-17 10:47:00'),(15,'cKCu4uJ8HD0nBe4g',NULL,'T_CST043','Komal Gahtori','komal@gmail.com','$2b$10$jsJ4xFwxLkIYfYYrT6i/xeXNwBH8DN89ka5VjUS/Mh67XqyGBAImG','Teacher',NULL,NULL,NULL,NULL,'A',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-17 10:55:25','2026-04-17 10:55:25'),(16,'hgY0XIWirbeWcIdo','221620101047',NULL,'Rahul Verma ','rahulverma.1.2005@gmail.com','$2b$10$9rUfNNmmSQfYgMIwHl45xeipXi/W3nDiRz2VzJ1zURKjcOHXRCVAm','Student',8,4,1,NULL,'A',67,11492,1,1,'CSE',NULL,'2026-04-17 14:14:45','2026-04-17 14:15:55');
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

-- Dump completed on 2026-04-17 20:25:58
