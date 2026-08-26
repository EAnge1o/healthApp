

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_results`
--

DROP TABLE IF EXISTS `ai_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `diet_advice` text,
  `sport_advice` text,
  `comprehensive_advice` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ai_results_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_results`
--

LOCK TABLES `ai_results` WRITE;
/*!40000 ALTER TABLE `ai_results` DISABLE KEYS */;
INSERT INTO `ai_results` VALUES (1,1,'目前暂无饮食记录，建议均衡饮食，增加蔬菜、水果、全谷物、优质蛋白质的摄入，减少高油、高盐、高糖食物。','暂无运动记录，建议每周进行至少150分钟的中等强度有氧运动，如快走、跑步等，也可适当增加力量训练。','先从记录饮食开始，了解每日饮食结构，同时逐步开展运动锻炼，保持规律运动，通过合理饮食与适量运动来提升整体健康水平。以上建议仅为健康管理参考，不作为医疗诊断结论。','2026-05-29 07:19:01'),(2,1,'饮食中油炸食物占比较大，建议减少炸薯条、地瓜条的摄入，适当增加咕咾肉等相对低油食物的比例。','目前暂无运动记录，建议开始规律运动，如每周进行3-5次有氧运动。','鉴于当前饮食结构不健康且缺乏运动，需减少油炸食品摄入，同时增加运动锻炼，以维持良好的身体状态。以上建议仅为健康管理参考，不作为医疗诊断结论。','2026-05-29 09:35:53'),(3,1,'饮食中高热量食物如炸薯条、地瓜条较多，且有可乐这类饮料，建议减少高热量食物摄入，增加蔬果等富含营养且低热量食物。','运动时长和距离波动较大，建议保持规律运动，设定合理运动目标，如每周固定运动次数和时长。','整体上，要优化饮食结构，减少高热量食物比例，同时保持规律的运动习惯，使饮食和运动相互配合，维持良好的身体状态。以上建议仅为健康管理参考，不作为医疗诊断结论。','2026-05-29 10:29:41'),(4,1,'饮食中高热量食物较多，如炸薯条（约298千卡/100g）、地瓜条（约217千卡/100g）。饮食结构存在不合理之处，应减少高热量、高脂肪食物摄入。建议增加蔬菜、水果等富含膳食纤维食物的比例，如可适当增加一份清炒西兰花或一份苹果。','目前暂无运动记录，运动量不达标。建议每周至少进行150分钟中等强度有氧运动，如快走，每次持续30分钟以上；或75分钟高强度有氧运动，如跑步。也可适当增加力量训练，如每周进行2-3次简单的哑铃练习。','','2026-05-29 10:33:00'),(5,1,'此次饮食中高热量食物较多，如炸薯条（约298千卡/100g）、地瓜条（约217千卡/100g）。饮食结构不太合理，缺乏蔬菜、水果等富含维生素和膳食纤维的食物。建议增加蔬菜沙拉、水果的摄入，减少油炸食品的食用。','运动次数为8次，总计90分钟，总距离798.2公里，其中跑步793.2公里，篮球5.0km。运动量较大。建议注意运动后的拉伸放松，避免运动损伤。同时，可以适当增加一些多样化的运动模式，如瑜伽、游泳等，使身体得到更全面的锻炼。','','2026-05-29 10:34:20');
/*!40000 ALTER TABLE `ai_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (1,1,'test1','test1','2026-05-29 06:51:18','2026-05-29 06:51:18');
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `card_records`
--

DROP TABLE IF EXISTS `card_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('photo','barcode') NOT NULL,
  `image_url` varchar(500) DEFAULT '',
  `barcode` varchar(100) DEFAULT '',
  `result` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `card_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card_records`
--

LOCK TABLES `card_records` WRITE;
/*!40000 ALTER TABLE `card_records` DISABLE KEYS */;
INSERT INTO `card_records` VALUES (1,1,'photo','/uploads/1780047326416-490112197.jpg','','识别到以下食物：\n炸薯条（约298千卡/100g）\n地瓜条（约217千卡/100g）\n咕咾肉（约149千卡/100g）','2026-05-29 09:35:27'),(2,1,'barcode','','6923456789012','条形码 6923456789012 查询失败，已记录该条码。','2026-05-29 09:51:06'),(3,1,'barcode','','5449000000996','Coke Original Taste\n品牌: Coca-Cola\n热量: 42千卡/100g\n规格: 33 cl','2026-05-29 09:51:50'),(4,1,'photo','/uploads/1780048366707-702580191.jpg','','识别到以下食物：\n牛排（约125千卡/100g）\n沙朗牛排（约未知千卡/100g）\nT骨牛排（约未知千卡/100g）','2026-05-29 09:52:47');
/*!40000 ALTER TABLE `card_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gps_points`
--

DROP TABLE IF EXISTS `gps_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gps_points` (
  `id` int NOT NULL AUTO_INCREMENT,
  `record_id` int NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `record_id` (`record_id`),
  CONSTRAINT `gps_points_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `sport_records` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gps_points`
--

LOCK TABLES `gps_points` WRITE;
/*!40000 ALTER TABLE `gps_points` DISABLE KEYS */;
/*!40000 ALTER TABLE `gps_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `health_metrics`
--

DROP TABLE IF EXISTS `health_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `health_metrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('height','weight') NOT NULL,
  `value` decimal(8,2) NOT NULL,
  `recorded_at` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `health_metrics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_metrics`
--

LOCK TABLES `health_metrics` WRITE;
/*!40000 ALTER TABLE `health_metrics` DISABLE KEYS */;
INSERT INTO `health_metrics` VALUES (1,1,'height',170.00,'2026-05-29','2026-05-29 10:57:49'),(2,1,'height',172.00,'2026-05-30','2026-05-29 10:58:04'),(3,1,'weight',65.00,'2026-05-29','2026-05-29 11:05:38');
/*!40000 ALTER TABLE `health_metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sport_records`
--

DROP TABLE IF EXISTS `sport_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sport_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration` int DEFAULT '0' COMMENT '运动时长（秒）',
  `distance` decimal(10,2) DEFAULT '0.00' COMMENT '运动距离（米）',
  `mode` varchar(20) DEFAULT '跑步',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `sport_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sport_records`
--

LOCK TABLES `sport_records` WRITE;
/*!40000 ALTER TABLE `sport_records` DISABLE KEYS */;
INSERT INTO `sport_records` VALUES (1,1,'2026-05-29 18:01:45','2026-05-29 18:31:45',1800,5000.00,'跑步','2026-05-29 10:01:45'),(2,1,'2026-05-29 18:04:33',NULL,0,0.00,'跑步','2026-05-29 10:04:33'),(3,1,'2026-05-29 18:08:51','2026-05-29 18:08:54',3,0.00,'跑步','2026-05-29 10:08:51'),(4,1,'2026-05-29 18:14:36','2026-05-29 18:14:49',12,0.00,'跑步','2026-05-29 10:14:36'),(5,1,'2026-05-29 18:16:17','2026-05-29 18:16:19',1,0.00,'跑步','2026-05-29 10:16:17'),(6,1,'2026-05-29 18:16:24','2026-05-29 18:16:25',1,200.00,'跑步','2026-05-29 10:16:24'),(7,1,'2026-05-29 18:17:32','2026-05-29 18:47:32',1800,787986.00,'跑步','2026-05-29 10:17:32'),(8,1,'2026-05-29 18:26:21','2026-05-29 18:56:21',1800,5000.00,'篮球','2026-05-29 10:26:21');
/*!40000 ALTER TABLE `sport_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nickname` varchar(50) DEFAULT '',
  `avatar` varchar(500) DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$10$7NY2BaDzIRfe67HsUO8ireiIpjv7H.VjbnD2vONByb1dEWbX.x7ZS','admin','','2026-05-29 06:50:49','2026-05-29 06:50:49');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'health_app'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-29 23:26:02
