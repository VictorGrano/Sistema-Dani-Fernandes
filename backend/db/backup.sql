-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: danifernandes
-- ------------------------------------------------------
-- Server version	5.6.13

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
-- Table structure for table `aromas`
--

DROP TABLE IF EXISTS `aromas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aromas` (
  `cod_aroma` varchar(4) DEFAULT NULL,
  `nome_aroma` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `historico_mudancas`
--

DROP TABLE IF EXISTS `historico_mudancas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_mudancas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `usuario` varchar(255) NOT NULL,
  `tabela_alterada` varchar(255) NOT NULL,
  `tipo_mudanca` varchar(50) NOT NULL,
  `produto_id` int(11) DEFAULT NULL,
  `lote` varchar(255) DEFAULT NULL,
  `valor_movimentacao` varchar(255) DEFAULT NULL,
  `valor_antigo` varchar(255) NOT NULL,
  `local_armazenado` varchar(255) DEFAULT NULL,
  `coluna` varchar(255) DEFAULT NULL,
  `data_mudanca` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `insumos`
--

DROP TABLE IF EXISTS `insumos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insumos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `estoque` int(11) DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `tipo_id` int(11) DEFAULT NULL,
  `local_armazenado` int(11) DEFAULT NULL,
  `coluna` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tipo_id` (`tipo_id`),
  KEY `local_armazenado` (`local_armazenado`),
  CONSTRAINT `insumos_ibfk_1` FOREIGN KEY (`tipo_id`) REFERENCES `tipo_insumo` (`id`),
  CONSTRAINT `insumos_ibfk_2` FOREIGN KEY (`local_armazenado`) REFERENCES `locais_armazenamento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lista_prateleira`
--

DROP TABLE IF EXISTS `lista_prateleira`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lista_prateleira` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `produto_id` int(11) NOT NULL,
  `lote_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `concluido` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `produto_id` (`produto_id`),
  KEY `lote_id` (`lote_id`),
  CONSTRAINT `lista_prateleira_ibfk_1` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`),
  CONSTRAINT `lista_prateleira_ibfk_2` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `locais_armazenamento`
--

DROP TABLE IF EXISTS `locais_armazenamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locais_armazenamento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome_local` varchar(255) NOT NULL,
  `estoque_utilizado` int(11) DEFAULT NULL,
  `estoque_total` int(11) DEFAULT NULL,
  `quantidade_produtos` int(11) DEFAULT '0',
  `quantidade_insumos` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lotes`
--

DROP TABLE IF EXISTS `lotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `produto_id` int(11) DEFAULT NULL,
  `nome_lote` varchar(255) DEFAULT NULL,
  `quantidade` int(11) DEFAULT NULL,
  `data_entrada` date DEFAULT NULL,
  `local_armazenado_id` int(11) DEFAULT NULL,
  `data_validade` date DEFAULT NULL,
  `data_fabricacao` date DEFAULT NULL,
  `coluna` varchar(50) DEFAULT NULL,
  `quantidade_caixas` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `produto_id` (`produto_id`),
  KEY `local_armazenado_id` (`local_armazenado_id`),
  CONSTRAINT `lotes_ibfk_1` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`),
  CONSTRAINT `lotes_ibfk_2` FOREIGN KEY (`local_armazenado_id`) REFERENCES `locais_armazenamento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER after_lotes_insert
AFTER INSERT ON lotes
FOR EACH ROW
BEGIN
  -- Atualiza o estoque total na tabela produtos
  UPDATE produtos
  SET estoque_total = estoque_total + NEW.quantidade
  WHERE id = NEW.produto_id;

  -- Adiciona a quantidade de produtos ao local de armazenamento
  UPDATE locais_armazenamento
  SET quantidade_produtos = quantidade_produtos + IFNULL(NEW.quantidade, 0),
      estoque_utilizado = estoque_utilizado + IFNULL(NEW.quantidade_caixas, 0)
  WHERE id = NEW.local_armazenado_id;
  
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER after_lotes_update
AFTER UPDATE ON lotes
FOR EACH ROW
BEGIN
  DECLARE qty_diff INT;
  SET qty_diff = NEW.quantidade - OLD.quantidade;

  -- Atualiza o estoque total na tabela produtos
  UPDATE produtos
  SET estoque_total = estoque_total + qty_diff
  WHERE id = NEW.produto_id;

  -- Verifica se o local de armazenamento foi alterado
  IF NEW.local_armazenado_id <> OLD.local_armazenado_id THEN
    
    -- Adiciona a quantidade de caixas e produtos ao novo local
    UPDATE locais_armazenamento
    SET estoque_utilizado = estoque_utilizado + IFNULL(NEW.quantidade_caixas, 0),
        quantidade_produtos = quantidade_produtos + IFNULL(NEW.quantidade, 0)
    WHERE id = NEW.local_armazenado_id;

    -- Subtrai a quantidade de caixas e produtos do antigo local
    UPDATE locais_armazenamento
    SET estoque_utilizado = estoque_utilizado - IFNULL(OLD.quantidade_caixas, 0),
        quantidade_produtos = quantidade_produtos - IFNULL(OLD.quantidade, 0)
    WHERE id = OLD.local_armazenado_id;

  ELSE
    -- Atualiza somente a quantidade de produtos e caixas se o local não foi alterado
    UPDATE locais_armazenamento
    SET estoque_utilizado = estoque_utilizado + qty_diff,
        quantidade_produtos = quantidade_produtos + qty_diff
    WHERE id = NEW.local_armazenado_id;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER after_lotes_delete
AFTER DELETE ON lotes
FOR EACH ROW
BEGIN
  -- Atualiza o estoque total na tabela produtos
  UPDATE produtos
  SET estoque_total = estoque_total - OLD.quantidade
  WHERE id = OLD.produto_id;

  -- Subtrai a quantidade de produtos e caixas do local de armazenamento
  UPDATE locais_armazenamento
  SET quantidade_produtos = quantidade_produtos - IFNULL(OLD.quantidade, 0),
      estoque_utilizado = estoque_utilizado - IFNULL(OLD.quantidade_caixas, 0)
  WHERE id = OLD.local_armazenado_id;
  
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `produtos`
--

DROP TABLE IF EXISTS `produtos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produtos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `categoria_id` int(11) DEFAULT NULL,
  `estoque_total` int(11) DEFAULT '0',
  `data_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cod_aroma` varchar(4) DEFAULT NULL,
  `unidade` varchar(5) DEFAULT NULL,
  `preco` decimal(6,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `produtos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `tipo_produto` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=295 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipo_insumo`
--

DROP TABLE IF EXISTS `tipo_insumo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_insumo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipo_produto`
--

DROP TABLE IF EXISTS `tipo_produto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_produto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome_categoria` varchar(255) NOT NULL,
  `sigla` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `login` varchar(50) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `primeiro_login` varchar(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'danifernandes'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-08-14 16:34:46
