-- phpMyAdmin SQL Dump
-- version 4.8.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 20.01.2019 klo 22:13
-- Palvelimen versio: 10.1.32-MariaDB
-- PHP Version: 7.2.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ptp`
--
CREATE DATABASE IF NOT EXISTS `ptp` DEFAULT CHARACTER SET utf8 COLLATE utf8_swedish_ci;
USE `ptp`;

-- --------------------------------------------------------

--
-- Rakenne taululle `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `kayttajatunnus` text COLLATE utf8_swedish_ci NOT NULL,
  `salasana` text COLLATE utf8_swedish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

--
-- Vedos taulusta `users`
--

INSERT INTO `users` (`id`, `kayttajatunnus`, `salasana`) VALUES
(32, 'besserwisser', '0b006251c563ea80622891f5ba2a4cd90d3fcb40bd9937541876a1effbc49293fb36e742e27365b21026afcf667770627082c81690da6aa486a6f0cddaebdeb7');

-- --------------------------------------------------------

--
-- Rakenne taululle `yritykset`
--

CREATE TABLE `yritykset` (
  `id` int(11) NOT NULL,
  `yritys` text COLLATE utf8_swedish_ci NOT NULL,
  `sijainti` text COLLATE utf8_swedish_ci NOT NULL,
  `hakuaika` date NOT NULL,
  `verkkosivu` text COLLATE utf8_swedish_ci NOT NULL,
  `yhteystiedot` text COLLATE utf8_swedish_ci NOT NULL,
  `muistiinpanot` text COLLATE utf8_swedish_ci NOT NULL,
  `kayttajaid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `yritykset`
--
ALTER TABLE `yritykset`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `yritykset`
--
ALTER TABLE `yritykset`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
