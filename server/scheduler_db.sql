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

USE bs1ylicpyexxhxy0nlri;

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
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (66,'Assignment','Cryptography','{\"id\": \"44a1091acf2eb87937042d3fbda5124f\", \"name\": \"Prof. Hardwari Lal Mandoria\"}','{\"years\": [\"4\"]}','{\"branches\": [\"AI\", \"CSE\"]}','{\"sections\": [\"A\"]}','Active','2025-12-15 05:54:13','2025-12-15 05:54:13','2025-12-22 11:24:00'),(67,'hi','fdgdgdsfgdsfgdsggsgg','{\"id\": \"44a1091acf2eb87937042d3fbda5124f\", \"name\": \"Prof. Hardwari Lal Mandoria\"}','{\"years\": [\"4\"]}','{\"branches\": [\"AI\", \"CSE\"]}','{\"sections\": [\"A\"]}','Expired','2025-12-15 05:58:11','2025-12-16 04:57:32','2025-12-15 11:28:00'),(68,'hi','fdgsgfdg','{\"id\": \"44a1091acf2eb87937042d3fbda5124f\", \"name\": \"Prof. Hardwari Lal Mandoria\"}','{\"years\": [\"4\"]}','{\"branches\": [\"CSE\", \"AI\"]}','{\"sections\": []}','Expired','2025-12-15 05:58:59','2025-12-16 04:57:32','2025-12-15 11:28:00'),(69,'hi','hey','{\"id\": \"44a1091acf2eb87937042d3fbda5124f\", \"name\": \"Prof. Hardwari Lal Mandoria\"}','{\"years\": [\"4\"]}','{\"branches\": [\"CSE\", \"AI\"]}','{\"sections\": [\"A\"]}','Expired','2025-12-15 05:59:54','2025-12-16 04:57:32','2025-12-15 11:29:00'),(70,'gdfgdfgd','gdafgdafgd','{\"id\": \"44a1091acf2eb87937042d3fbda5124f\", \"name\": \"Prof. Hardwari Lal Mandoria\"}','{\"years\": [\"1\"]}','{\"branches\": [\"all\"]}','{\"sections\": [\"A\"]}','Expired','2025-12-15 06:01:02','2025-12-16 04:57:32','2025-12-15 11:30:00'),(71,'hiiiii','heyyyyyyyyyyy','{\"id\": \"44a1091acf2eb87937042d3fbda5124f\", \"name\": \"Prof. Hardwari Lal Mandoria\"}','{\"years\": [\"4\"]}','{\"branches\": [\"CSE\", \"AI\"]}','{\"sections\": [\"A\"]}','Expired','2025-12-15 06:07:35','2025-12-16 04:57:32','2025-12-15 11:37:00'),(72,'hiiiiiiiiiiiii','heytyyyyyyyyyyyyyyyyyyyyyyyyyyyy','{\"id\": \"44a1091acf2eb87937042d3fbda5124f\", \"name\": \"Prof. Hardwari Lal Mandoria\"}','{\"years\": [\"4\"]}','{\"branches\": [\"all\"]}','{\"sections\": [\"A\"]}','Expired','2025-12-15 06:08:03','2025-12-16 04:57:32','2025-12-15 11:38:00'),(73,'assignm','csdfasfdsafads','{\"id\": \"44a1091acf2eb87937042d3fbda5124f\", \"name\": \"Prof. Hardwari Lal Mandoria\"}','{\"years\": [\"4\"]}','{\"branches\": [\"AI\", \"CSE\"]}','{\"sections\": [\"A\"]}','Expired','2025-12-17 08:22:26','2025-12-19 09:56:02','2025-12-19 13:52:00');
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
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
  `affected_days` set('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  UNIQUE KEY `unique_leave` (`student_id`,`teacher_id`,`applicable_from`,`applicable_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaves`
--

LOCK TABLES `leaves` WRITE;
/*!40000 ALTER TABLE `leaves` DISABLE KEYS */;
INSERT INTO `leaves` VALUES ('Anu Verma',4,'ME','221620101001','not a teacher','abcd','subject: abcd\n','2025-12-16 08:05:48','2025-12-15 18:30:00','2025-12-18 18:30:00','Pending','A','Tuesday,Wednesday,Thursday,Friday'),('Rahul Verma',4,'CSE','221620101047','not a teacher','sdfndsafnsda','subject: sdfndsafnsda\n','2025-12-16 08:29:00','2025-12-15 18:30:00','2025-12-16 18:30:00','Approved','A','Tuesday,Wednesday'),('Rahul Verma',4,'CSE','221620101047','not a teacher','abc','subject: abc\n','2025-12-16 04:58:34','2025-12-15 18:30:00','2025-12-17 18:30:00','Approved','A','Tuesday,Wednesday,Thursday'),('Rahul Verma',4,'CSE','221620101047','not a teacher','acdef','subject: acdef\n','2025-12-16 08:20:44','2025-12-16 18:30:00','2025-12-19 18:30:00','Approved','A','Wednesday,Thursday,Friday,Saturday');
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
INSERT INTO `schedule` VALUES (1,'CSE','Computer Science and Engineering',4,'A','Monday',1,'CST-030','Machine Learning',27,'1ec4c7e33832d30025c7fbf27f74762f','Mrs. Komal Gahtori',0,NULL,NULL,NULL,NULL),(2,'CSE','Computer Science and Engineering',4,'A','Monday',2,'CST-035','Cryptography & Network Security',27,'44a1091acf2eb87937042d3fbda5124f','Prof. Hardwari Lal Mandoria ',0,NULL,NULL,NULL,NULL),(3,'CSE','Computer Science and Engineering',4,'A','Monday',7,'CET-055','Renewable Energy',27,'cdf9328e8a974060b50de5cc670632a2','Dr. Anjali Singh ',0,NULL,NULL,NULL,NULL),(13,'CSE','Computer Science and Engineering',4,'A','Wednesday',2,'CST-035','Cryptography & Network Security',27,'44a1091acf2eb87937042d3fbda5124f','Prof. Hardwari Lal Mandoria',0,NULL,NULL,NULL,NULL),(14,'CSE','Computer Science and Engineering',4,'A','Wednesday',3,'CSP-018','Project Seminar',27,'f13c2d5fd0c18f368f5b44c5ff9418f0','Mr. Naresh Kumar',0,NULL,NULL,NULL,NULL),(15,'CSE','Computer Science and Engineering',4,'A','Wednesday',4,'CSP-018','Project Seminar',27,'f13c2d5fd0c18f368f5b44c5ff9418f0','Mr. Naresh Kumar',0,NULL,NULL,NULL,NULL),(16,'CSE','Computer Science and Engineering',4,'A','Wednesday',6,'AHT-015','Rural Development Administration and Planning',27,'53910456cc218427a3a04db2ccf344b1','Mr. Ambikesh Yadav',0,NULL,NULL,NULL,NULL),(17,'CSE','Computer Science and Engineering',4,'A','Wednesday',7,'AHT-018','Innovation & Problem Solving',27,'be5ee2ced8a2777463d6effffd971220','Dr. Abhishek Pathak',0,NULL,NULL,NULL,NULL),(18,'CSE','Computer Science and Engineering',4,'A','Thursday',1,'AHT-018','Innovations and Problem Solving',27,'be5ee2ced8a2777463d6effffd971220','Dr. Abhishek Pathak',0,NULL,NULL,NULL,NULL),(19,'CSE','Computer Science and Engineering',4,'A','Thursday',2,'CST-030','Machine Learning',27,'1ec4c7e33832d30025c7fbf27f74762f','Mrs. Komal Gahtori',0,NULL,NULL,NULL,NULL),(20,'CSE','Computer Science and Engineering',4,'A','Thursday',3,'AHT-015','Rural Development Administration and Planning',27,'53910456cc218427a3a04db2ccf344b1','Mr. Ambikesh Yadav',0,NULL,NULL,NULL,NULL),(21,'CSE','Computer Science and Engineering',4,'A','Thursday',6,'CSP-020','Mini Project-III / Internship-III',27,'43f1a7b9df7669168f46e8d6567635f9','Mrs. Snehlata Singh',0,NULL,NULL,NULL,NULL),(22,'CSE','Computer Science and Engineering',4,'A','Thursday',7,'CSP-020','Mini Project-III / Internship-III',27,'43f1a7b9df7669168f46e8d6567635f9','Mrs. Snehlata Singh',0,NULL,NULL,NULL,NULL),(23,'CSE','Computer Science and Engineering',4,'A','Friday',1,'CST-030','Machine Learning',27,'1ec4c7e33832d30025c7fbf27f74762f','Mrs. Komal Gahtori',0,NULL,NULL,NULL,NULL),(24,'CSE','Computer Science and Engineering',4,'A','Friday',3,'AHT-017','Disaster Management',27,'2593d6ee63844ac4dc1c6a6f019c8936','Mr. Lovejeet Singh',0,NULL,NULL,NULL,NULL),(25,'CSE','Computer Science and Engineering',4,'A','Friday',4,'CSP-019','Design Project',27,'b097cb0332f7ceef9a96be77eefbcf22','Mr. Divish Jaiswal',0,NULL,NULL,NULL,NULL),(26,'CSE','Computer Science and Engineering',4,'A','Friday',6,'CSP-019','Design Project',27,'b097cb0332f7ceef9a96be77eefbcf22','Mr. Divish Jaiswal',0,NULL,NULL,NULL,NULL),(27,'CSE','Computer Science and Engineering',4,'A','Friday',8,'CSP-019','Design Project',27,'b097cb0332f7ceef9a96be77eefbcf22','Mr. Divish Jaiswal',0,NULL,NULL,NULL,NULL),(28,'CSE','Computer Science and Engineering',4,'A','Saturday',1,'CET-055','Renewable Energy',27,'cdf9328e8a974060b50de5cc670632a2','Dr. Anjali Singh',0,NULL,NULL,NULL,NULL),(29,'CSE','Computer Science and Engineering',4,'A','Saturday',2,'AHT-017','Disaster Management',27,'2593d6ee63844ac4dc1c6a6f019c8936','Mr. Lovejeet Singh',0,NULL,NULL,NULL,NULL),(30,'CSE','Computer Science and Engineering',4,'A','Saturday',6,'AHT-015','Rural Development Administration and Planning',27,'1f6ad618ffe57b509be4d9244ba24903','Mr. Anubhav Yadav',0,NULL,NULL,NULL,NULL),(31,'CSE','Computer Science and Engineering',4,'A','Saturday',8,'CSP-019','Design Project',27,'b097cb0332f7ceef9a96be77eefbcf22','Mr. Divish Jaiswal',0,NULL,NULL,NULL,NULL),(32,'CSE','Computer Science and Engineering',4,'A','Tuesday',2,'CST-035','Cryptography & Network Security',28,'44a1091acf2eb87937042d3fbda5124f','Prof. Hardwari Lal Mandoria',0,NULL,NULL,NULL,NULL),(33,'CSE','Computer Science and Engineering',4,'A','Tuesday',3,'AHT-018','Innovations and Problem Solving',27,'be5ee2ced8a2777463d6effffd971220','Dr. Abhishek Pathak',0,NULL,NULL,NULL,NULL),(34,'CSE','Computer Science and Engineering',4,'A','Tuesday',4,'CET-055','Renewable Energy',27,'cdf9328e8a974060b50de5cc670632a2','Dr. Anjali Singh',0,NULL,NULL,NULL,NULL),(35,'CSE','Computer Science and Engineering',4,'A','Tuesday',6,'AHT-015','Rural Development Administration and Planning',27,'53910456cc218427a3a04db2ccf344b1','Mr. Ambikesh Yadav',0,NULL,NULL,NULL,NULL),(36,'CSE','Computer Science and Engineering',4,'A','Tuesday',7,'AHT-017','Disaster Management',27,'2593d6ee63844ac4dc1c6a6f019c8936','Mr. Lovejeet Singh',0,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) DEFAULT NULL,
  `teacher_id` varchar(32) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` char(60) NOT NULL,
  `role` enum('Student','Teacher','Admin') NOT NULL DEFAULT 'Student',
  `branch` varchar(100) DEFAULT NULL,
  `year` varchar(10) DEFAULT NULL,
  `fcm_token` varchar(512) DEFAULT NULL,
  `section` char(1) DEFAULT 'A',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (6,'NULL','1234567890','Rishab','rishab@gmail.com','$2b$10$O0wNviozlNurK7qwUJg4DuSs8icRlQp9sl0xY8nrLd/NvlGU/mFbS','Teacher','NULL','NULL','flPFK3OO3fOGmfF8A1GzIK:APA91bGfRipR9ZSAt97p8jt2cU2SO_oA74sNsHMTHtT5hthjKxk0x6S7JrVupSEYqj-QGUP6euMbbf0CcYYg5drFv58HIzSRRm6CRUfNRUOw8DT8PNxe3uY',NULL),(7,'221620101047','NULL','Rahul Verma','rahulverma.1.2005@gmail.com','$2b$10$d.serupI5dOK7yJGd4i8puCr/wnFcl9jIvJF0ZZzOA57EVuDHzW0K','Student','CSE','4','e1PuS6D6Z00lZhqwiupCKH:APA91bHTaG24e_D1ACyMs4v9V3JtCVHQf3MvcF-U702g8xOXqj3yNz-d7HtKDmCZJD_ziYlv5x-bKHJzwSObrkvY3ms4sD_CjlThzyO1d41_iNYFXHLAdRw','A'),(9,'NULL','44a1091acf2eb87937042d3fbda5124f','Prof. Hardwari Lal Mandoria','hardwarilal@gmail.com','$2b$10$YlPhaHTTxCQAraMAwSO/vOpqyPkNBd.Y7gSMXDy5eCKNcfro40GJi','Teacher','NULL','NULL','cOricKth-NmtEzRh919Qfp:APA91bFGH8yMVuGLmZVx-MDCHRf12K1pfJDDp5Zrf65Ou7Ymmghqt7ko-RK5x_8enQxJMb53LDJBn4D2iHPlKYw08BnH2phVmLbIAUeZ7wVGcw7l2wFsqec','A'),(10,'221620101001','NULL','Anu Verma','anu.verma@gmail.com','$2b$10$48dO20xPgoAgH0KdiTnC2uc0XkLwRoGTG7bKVdqZyU96BXEu6C2VS','Student','ME','4','e1PuS6D6Z00lZhqwiupCKH:APA91bHTaG24e_D1ACyMs4v9V3JtCVHQf3MvcF-U702g8xOXqj3yNz-d7HtKDmCZJD_ziYlv5x-bKHJzwSObrkvY3ms4sD_CjlThzyO1d41_iNYFXHLAdRw','A'),(11,'NULL','1ec4c7e33832d30025c7fbf27f74762f','Mrs. Komal Gahtori','komal@gmail.com','$2b$10$2sAuuCfKh58zeclzpR/E1.vNX3.kYLKCph0e4h4QKGChK4doY6f3u','Teacher','NULL','NULL',NULL,'A'),(12,'NULL','sfadfafadsfsafsfsdaf','Rishabh ','rishasbh@gmail.com','$2b$10$YLVxDa9iJny25PWDaBxy2et.cecfVH9b990BZbkjl6JLfXnJwEN5y','Teacher','NULL','NULL',NULL,'A');
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

-- Dump completed on 2025-12-19 19:27:55
