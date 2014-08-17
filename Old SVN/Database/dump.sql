-- MySQL dump 10.13  Distrib 5.6.13, for Win32 (x86)
--
-- Host: localhost    Database: goatrans
-- ------------------------------------------------------
-- Server version	5.6.16

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `goatrans`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `goatrans` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `goatrans`;

--
-- Table structure for table `bus`
--

DROP TABLE IF EXISTS `bus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bus` (
  `bus_id` int(11) DEFAULT NULL,
  `curr_trip_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  KEY `bus_id` (`bus_id`),
  KEY `curr_trip_id` (`curr_trip_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `bus_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `location` (`bus_id`),
  CONSTRAINT `bus_ibfk_2` FOREIGN KEY (`curr_trip_id`) REFERENCES `trip` (`trip_id`),
  CONSTRAINT `bus_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus`
--

LOCK TABLES `bus` WRITE;
/*!40000 ALTER TABLE `bus` DISABLE KEYS */;
/*!40000 ALTER TABLE `bus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `company` (
  `company_name` varchar(255) DEFAULT NULL,
  `company_id` int(11) NOT NULL DEFAULT '0',
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `location` (
  `bus_id` int(11) NOT NULL DEFAULT '0',
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  PRIMARY KEY (`bus_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `route`
--

DROP TABLE IF EXISTS `route`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `route` (
  `route_id` int(11) NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`route_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route`
--

LOCK TABLES `route` WRITE;
/*!40000 ALTER TABLE `route` DISABLE KEYS */;
INSERT INTO `route` VALUES (1,0);
/*!40000 ALTER TABLE `route` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routestop`
--

DROP TABLE IF EXISTS `routestop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `routestop` (
  `stop_id` int(11) DEFAULT NULL,
  `route_id` int(11) DEFAULT NULL,
  `sequence` int(11) DEFAULT NULL,
  `route_stop_id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`route_stop_id`),
  KEY `route_id` (`route_id`),
  KEY `stop_id` (`stop_id`),
  CONSTRAINT `routestop_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `route` (`route_id`),
  CONSTRAINT `routestop_ibfk_2` FOREIGN KEY (`stop_id`) REFERENCES `stop` (`stop_id`)
) ENGINE=InnoDB AUTO_INCREMENT=234 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routestop`
--

LOCK TABLES `routestop` WRITE;
/*!40000 ALTER TABLE `routestop` DISABLE KEYS */;
INSERT INTO `routestop` VALUES (1,1,1,1),(51,1,2,2),(52,1,3,3),(53,1,4,4),(54,1,5,5),(55,1,6,6),(56,1,7,7),(57,1,8,8),(58,1,9,9),(59,1,10,10),(60,1,11,11),(61,1,12,12),(62,1,13,13),(63,1,14,14),(64,1,15,15),(65,1,16,16),(66,1,17,17),(5,1,18,18);
/*!40000 ALTER TABLE `routestop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routestoptrip`
--

DROP TABLE IF EXISTS `routestoptrip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `routestoptrip` (
  `route_stop_id` int(11) DEFAULT NULL,
  `trip_id` int(11) DEFAULT NULL,
  `time` time,
  KEY `route_stop_id` (`route_stop_id`),
  KEY `trip_id` (`trip_id`),
  CONSTRAINT `routestoptrip_ibfk_1` FOREIGN KEY (`route_stop_id`) REFERENCES `routestop` (`route_stop_id`),
  CONSTRAINT `routestoptrip_ibfk_2` FOREIGN KEY (`trip_id`) REFERENCES `trip` (`trip_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routestoptrip`
--

LOCK TABLES `routestoptrip` WRITE;
/*!40000 ALTER TABLE `routestoptrip` DISABLE KEYS */;
INSERT INTO `routestoptrip` VALUES (1,1,'09:03:00'),(2,1,'09:06:00'),(3,1,'09:08:00'),(4,1,'09:10:00'),(5,1,'09:12:00'),(6,1,'09:15:00'),(7,1,'09:18:00'),(8,1,'09:22:00'),(9,1,'09:25:00'),(10,1,'09:28:00'),(11,1,'09:30:00'),(12,1,'09:33:00'),(13,1,'09:36:00'),(14,1,'09:39:00'),(15,1,'09:42:00'),(16,1,'09:45:00'),(17,1,'09:48:00'),(18,1,'09:51:00');
/*!40000 ALTER TABLE `routestoptrip` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `segment`
--

DROP TABLE IF EXISTS `segment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `segment` (
  `stop1_id` int(11) DEFAULT NULL,
  `stop2_id` int(11) DEFAULT NULL,
  `distance` float DEFAULT NULL,
  KEY `stop1_id` (`stop1_id`),
  KEY `stop2_id` (`stop2_id`),
  CONSTRAINT `segment_ibfk_1` FOREIGN KEY (`stop1_id`) REFERENCES `stop` (`stop_id`),
  CONSTRAINT `segment_ibfk_2` FOREIGN KEY (`stop2_id`) REFERENCES `stop` (`stop_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `segment`
--

LOCK TABLES `segment` WRITE;
/*!40000 ALTER TABLE `segment` DISABLE KEYS */;
INSERT INTO `segment` VALUES (1,2,5),(1,3,4),(1,6,4);
/*!40000 ALTER TABLE `segment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stop`
--

DROP TABLE IF EXISTS `stop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stop` (
  `stop_id` int(11) NOT NULL AUTO_INCREMENT,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`stop_id`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stop`
--

LOCK TABLES `stop` WRITE;
/*!40000 ALTER TABLE `stop` DISABLE KEYS */;
INSERT INTO `stop` VALUES (1,15.4951,73.8372,'KTC Panjim'),(2,15.2875,73.9562,'KTC Margao'),(3,15.4002,73.821,'KTC Vasco'),(4,15.4064,73.997,'KTC Ponda'),(5,15.5892,73.8101,'KTC Mapusa'),(6,15.5615,74.01,'KTC Sanquelim'),(7,15.5461,74.0523,'KTC Honda'),(8,15.5884,73.9497,'KTC Bicholim'),(9,15.619,73.9014,'KTC Assnora'),(10,15.7163,73.7988,'KTC Pernem'),(11,15.5328,74.1414,'KTC Valpoi'),(12,15.2613,74.1068,'KTC Curchorem'),(13,15.1824,73.9973,'KTC Cuncolim'),(14,15.0084,74.044,'KTC Canacona'),(15,15.2279,74.1518,'KTC Sanguem'),(16,15.5159,73.9614,'KTC Marcela'),(17,15.3213,74.0275,'KTC Shiroda'),(18,15.5042,73.8624,'Ribandar Patto'),(19,15.5058,73.8642,'Chorao Ferry'),(20,15.5028,73.8688,'Ribandar Badminton Court'),(21,15.5019,73.8747,'Goa Institute of Management'),(22,15.5003,73.8776,'Divar Ferry'),(23,15.4996,73.8928,'Saw Mill'),(24,15.5002,73.8965,'Sao Pedro Church'),(25,15.5004,73.9018,'MIRacle Emporium'),(26,15.5019,73.9101,'Old Goa Church'),(27,15.5011,73.915,'Old Goa Bus Stop'),(28,15.499,73.919,'Old Goa Masjid'),(29,15.4976,73.9248,'Carambolim Station'),(30,15.4971,73.9279,'Corlim Petrol Pump'),(31,15.4969,73.9296,'Corlim IDC'),(32,15.4949,73.937,'Montfort ITI'),(33,15.4934,73.9407,'Syngenta'),(34,15.4931,73.9451,'Dhulapi'),(35,15.4899,73.9576,'Banastarim Junction Bus Stop'),(36,15.4844,73.9588,'Muslim Wada'),(37,15.475,73.9639,'Bhoma'),(38,15.4617,73.96,'Kundaim Village'),(39,15.4557,73.9644,'Kundaim IDC'),(40,15.4559,73.9668,'Balaji Temple'),(41,15.4466,73.9701,'Mangeshi'),(42,15.4414,73.9743,'Mardol'),(43,15.4392,73.9758,'Mardol Masjid'),(44,15.4368,73.9772,'Veling'),(45,15.4337,73.9858,'Konem'),(46,15.4156,73.9873,'PES Pharmacy'),(47,15.4128,73.9888,'Farmagudi Circle'),(48,15.4085,73.9925,'GVMs College'),(49,15.4049,74.0031,'Hotel Sun Inn'),(50,15.4007,74.004,'Ponda Old Bus Stand'),(51,15.5077,73.836,'Betim Circle'),(52,15.5113,73.8349,'Secreteriat'),(53,15.5139,73.8352,'Sai Service'),(54,15.5158,73.8345,'Pundalik Nagar'),(55,15.5184,73.8291,'Porvorim Petrol Pump'),(56,15.5204,73.8288,'Teen Building'),(57,15.5247,73.8276,'Training College'),(58,15.5257,73.8266,'PDA Colony Porvorim'),(59,15.5315,73.8247,'Co-Oqueiro'),(60,15.534,73.8239,'Porvorim Chapel'),(61,15.5414,73.8215,'Porvorim Vadakaden'),(62,15.5455,73.8197,'Damian De Goa'),(63,15.5526,73.8174,'Porvorim Bazaar'),(64,15.5655,73.8083,'Guirim Cross'),(65,15.5745,73.8065,'Green Park'),(66,15.5791,73.8061,'Guirim'),(67,15.501,73.8293,'Old Secreteriat'),(68,15.5013,73.8256,'Ferry Boat'),(69,15.5003,73.8216,'Panjim Market'),(70,15.4942,73.8185,'Kala Academy'),(71,15.4906,73.8155,'Campal'),(72,15.4835,73.809,'Miramar'),(73,15.2678,73.9598,'Stop1');
/*!40000 ALTER TABLE `stop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trip`
--

DROP TABLE IF EXISTS `trip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trip` (
  `trip_id` int(11) NOT NULL AUTO_INCREMENT,
  `direction` tinyint(1) DEFAULT NULL,
  `route_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`trip_id`),
  KEY `route_id` (`route_id`),
  CONSTRAINT `trip_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `route` (`route_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trip`
--

LOCK TABLES `trip` WRITE;
/*!40000 ALTER TABLE `trip` DISABLE KEYS */;
INSERT INTO `trip` VALUES (1,0,1),(2,0,1),(3,0,1),(4,1,1),(5,1,1),(6,1,1);
/*!40000 ALTER TABLE `trip` ENABLE KEYS */;
UNLOCK TABLES;