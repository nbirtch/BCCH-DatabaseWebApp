USE BCCH_FUTURE_STAR;

/* USER */
INSERT INTO `User` VALUES (1, 'raymond', "Raymond C", '00b677afc83232cc2fe7f706dac6dd1fbfc4495da59882703d4cd4750d3c7e72', 10, 'MALE', 'MALE', 1583111154000, '1997/01/09', 0);
INSERT INTO `User` VALUES (2, 'lang', "Lang C", '00b677afc83232cc2fe7f706dac6dd1fbfc4495da59882703d4cd4750d3c7e72', 15, 'MALE', 'MALE', 1583111154000, '9999/12/31', 0);
INSERT INTO `User` VALUES (3, 'admin', "Admin A", 'd78aa3e4c059b78952030990b807adc5c2473de62ca992ed55fda758abaa0cc4', 0, 'N/A', 'N/A', 1583111154000, '9999/12/31', 1);

/* ASSESSMENT TEMPLATE */
INSERT INTO `AssessmentTemplate` VALUES (1, 'Selfie Rating', 'In this session, participants will take a selfie of themselves and rate how tired they are on the Karolinska scale', 0, 1, 1, 1583111154000, 0);
INSERT INTO `AssessmentTemplate` VALUES (2, 'Vigilance Pong', 'Pong is a motor control task that can be quantitatively scored to assess performance.', 1, 0, 2, 1583111154000, 0);
INSERT INTO `AssessmentTemplate` VALUES (3, 'Task-Switching Paradigm', 'Task-switching is a cognitive task that requires shifting focus depending on the task at hand. Thus, comparing the speed and accuracy at a single task vs. shifting between multiple tasks assesses higher cognitive functions', 3, 1, 1, 1583111154000, 0);
INSERT INTO `AssessmentTemplate` VALUES (4, 'Demo Assessment', 'Demo description', 2, 2, 2, 1583111154000, 0);

/* Video Description */
INSERT INTO `VideoDescription` VALUES (1, 2, "Video of participant playing pong");
INSERT INTO `VideoDescription` VALUES (2, 3, "Video of participant performing task switch paradigm game");
INSERT INTO `VideoDescription` VALUES (3, 4, "Video of participant performing task switch paradigm game");
INSERT INTO `VideoDescription` VALUES (4, 4, "video of participant sleeping");

/* Picture Description */
INSERT INTO `PictureDescription` VALUES (1, 1, "Selfie Photo");
INSERT INTO `PictureDescription` VALUES (2, 3, "sefile 1");
INSERT INTO `PictureDescription` VALUES (3, 3, "sefile 2");
INSERT INTO `PictureDescription` VALUES (4, 3, "sefile 3");
INSERT INTO `PictureDescription` VALUES (5, 4, "sefile 1");
INSERT INTO `PictureDescription` VALUES (6, 4, "pictue showing your hands");
INSERT INTO `PictureDescription` VALUES (7, 4, "picture showing your legs");

/* Survey Template */
INSERT INTO `SurveyTemplate` VALUES (1, "Karolinska Sleepiness Scale", "This is a sample instruction for researchers to ask patients to follow when performing this survey.", 1583111154000);
INSERT INTO `SurveyTemplate` VALUES (2, "Vigilance Pong Scoresheet", "This is a sample instruction for researchers to ask patients to follow when performing this survey.", 1583111154000);
INSERT INTO `SurveyTemplate` VALUES (3, "Task-Switching Paradigm", "This is a sample instruction for researchers to ask patients to follow when performing this survey.", 1583111154000);

/* Survey Question */
/* 
  1: Fill in the blanks(normal text)
  2: Fill in the blanks(time) 
  3: Multiple Choice
  4: Scale
  5: Large text
  6: Fill in the blank (number)
*/
INSERT INTO `SurveyQuestion` VALUES (1, 1, 4, "On a scale of 1 (extremely alert) to 10 (extremely sleepy), rate your sleepiness: .", '{"max": 10, "min": 1}');
INSERT INTO `SurveyQuestion` VALUES (2, 1, 1, "please fill out the following _____ .", "{}");
INSERT INTO `SurveyQuestion` VALUES (3, 1, 5, "tell us something about yourself.", "{}");

INSERT INTO `SurveyQuestion` VALUES (1, 2, 6, "In 30 seconds, how many total throws were made?  (can be unknown, or non-negative integer)", "{}");
INSERT INTO `SurveyQuestion` VALUES (2, 2, 6, "In 30 seconds, how many successful throws were made?  (non-negative integer)", "{}");

INSERT INTO `SurveyQuestion` VALUES (1, 3, 2, "Time taken to complete single task exercise: (in MM:SS format)", "{}");
INSERT INTO `SurveyQuestion` VALUES (2, 3, 6, "Number of incorrect answers in single task exercise: (non-negative integer)", "{}");
INSERT INTO `SurveyQuestion` VALUES (3, 3, 2, "Time taken to complete task switching exercise: ________ (in MM:SS format)", "{}");
INSERT INTO `SurveyQuestion` VALUES (4, 3, 6, "Number of incorrect answers in task switching exercise: _______ (non-negative integer)", "{}");

/* HasSurvey */
INSERT INTO `HasSurvey` VALUES (1, 1);
INSERT INTO `HasSurvey` VALUES (2, 1);
INSERT INTO `HasSurvey` VALUES (2, 2);
INSERT INTO `HasSurvey` VALUES (3, 3);
INSERT INTO `HasSurvey` VALUES (4, 1);
INSERT INTO `HasSurvey` VALUES (4, 2);
INSERT INTO `HasSurvey` VALUES (4, 3);
