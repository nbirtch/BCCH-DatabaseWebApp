DROP DATABASE IF EXISTS BCCH_FUTURE_STAR;
CREATE DATABASE BCCH_FUTURE_STAR;
USE BCCH_FUTURE_STAR;

DROP TABLE IF EXISTS `Video`;
DROP TABLE IF EXISTS `Picture`;
DROP TABLE IF EXISTS `SurveyAnswer`;
DROP TABLE IF EXISTS `Survey`;
DROP TABLE IF EXISTS `Assessment`;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS `HasSurvey`;
DROP TABLE IF EXISTS `PictureDescription`;
DROP TABLE IF EXISTS `VideoDescription`;
DROP TABLE IF EXISTS `SurveyQuestion`;
DROP TABLE IF EXISTS `AssessmentTemplate`;
DROP TABLE IF EXISTS `SurveyTemplate`;


CREATE TABLE `User` (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE,
  display_name VARCHAR(255),
  hash_pass VARCHAR(255),
  age INTEGER,
  gender CHAR(10),
  sex CHAR(10),
  date_created BIGINT,
  date_of_birth VARCHAR(100),
  is_admin INTEGER
);

CREATE TABLE `AssessmentTemplate` (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  description VARCHAR(255),
  num_videos INTEGER,
  num_pics INTEGER,
  num_surveys INTEGER,
  time_created BIGINT,
  is_archived BIGINT
);

CREATE TABLE `SurveyTemplate` (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  instruction VARCHAR(255),
  time_created BIGINT
);

/* Survey Question */
/* 
  1: Fill in the blanks(normal text)
  2: Fill in the blanks(time) 
  3: Multiple Choice
  4: Scale
  5: Large text
*/
CREATE TABLE `SurveyQuestion` (
  q_number INTEGER,
  temp_id INTEGER,
  PRIMARY kEY (q_number, temp_id),
  q_type INTEGER,
  statement VARCHAR(255),
  meta VARCHAR(255),
  FOREIGN KEY (temp_id) REFERENCES SurveyTemplate(id)
    ON UPDATE CASCADE
);

CREATE TABLE `HasSurvey` (
  assess_temp_id INTEGER,
  sur_temp_id INTEGER,
  FOREIGN KEY (assess_temp_id) REFERENCES AssessmentTemplate(id) 
    ON UPDATE CASCADE,
  FOREIGN KEY (sur_temp_id) REFERENCES SurveyTemplate(id) 
    ON UPDATE CASCADE
);

CREATE TABLE `PictureDescription` (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  temp_id INTEGER,
  description VARCHAR(255),
  FOREIGN kEY (temp_id) REFERENCES AssessmentTemplate(id) 
    ON UPDATE CASCADE
);

CREATE TABLE `VideoDescription` (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  temp_id INTEGER,
  description VARCHAR(255),
  FOREIGN kEY (temp_id) REFERENCES AssessmentTemplate(id) 
    ON UPDATE CASCADE
);


CREATE TABLE `Assessment` (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  temp_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  time_created BIGINT,
  is_archived INTEGER,
  FOREIGN kEY (temp_id) REFERENCES AssessmentTemplate(id) 
    ON UPDATE CASCADE,
  FOREIGN kEY (user_id) REFERENCES User(id) 
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE `Video` (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  assess_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  path VARCHAR(255),
  time_created BIGINT,
  is_archived INTEGER,
  FOREIGN kEY (assess_id) REFERENCES Assessment(id) 
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN kEY (user_id) REFERENCES User(id) 
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE `Picture` (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  assess_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  path VARCHAR(255),
  time_created BIGINT,
  is_archived INTEGER,
  FOREIGN kEY (assess_id) REFERENCES Assessment(id) 
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN kEY (user_id) REFERENCES User(id) 
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE `Survey` (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  assess_id INTEGER,
  temp_id INTEGER,
  user_id INTEGER,
  time_created BIGINT,
  is_archived INTEGER,
  FOREIGN kEY (assess_id) REFERENCES Assessment(id) 
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (temp_id) REFERENCES SurveyTemplate(id)
    ON UPDATE CASCADE,
  FOREIGN kEY (user_id) REFERENCES User(id) 
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE `SurveyAnswer` (
  q_number INTEGER,
  survey_id INTEGER,
  PRIMARY KEY (q_number, survey_id),
  user_id INTEGER,
  answer VARCHAR(255),
  FOREIGN kEY (survey_id) REFERENCES Survey(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES User(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);