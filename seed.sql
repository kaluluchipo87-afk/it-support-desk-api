-- Made-up starting records for the IT Support Desk.
-- db.js runs this ONCE, only when the records table is first created.
-- (In SQL, a single quote inside text is written as two quotes: '' )
INSERT INTO records (title, category, description, status) VALUES
  ('Wi-Fi keeps dropping in Library Room 2', 'Network',
   'Laptops lose the campus Wi-Fi connection every few minutes in Library Room 2, mostly in the afternoon.', 'In progress'),
  ('Cannot install Microsoft Office', 'Software',
   'The Office installer stops at 60% with error code 30015 on a new staff laptop in the Accounts office.', 'Pending'),
  ('Desktop computer will not power on', 'Hardware',
   'The computer at Reception Desk 1 shows no lights and makes no sound when the power button is pressed.', 'Pending'),
  ('Student portal password reset', 'Accounts',
   'A first-year student is locked out of the student portal after three wrong password attempts.', 'Completed'),
  ('Printer jams on Ground Floor', 'Printing',
   'The shared printer near the Ground Floor lab jams on every second page when printing double-sided.', 'Pending'),
  ('VPN fails when working off campus', 'Network',
   'Lecturers report that the VPN client says ''authentication timeout'' when connecting from home.', 'Pending'),
  ('Antivirus update error in Lab C', 'Software',
   'All 30 computers in Lab C show a warning that antivirus definitions are more than 14 days old.', 'Completed'),
  ('Projector in Lecture Hall B shows no signal', 'Hardware',
   'The projector turns on but displays ''No signal'' when a laptop is connected using the HDMI cable.', 'In progress'),
  ('New email account for staff member', 'Accounts',
   'Create a university email account for a new lecturer joining the Computer Science department on Monday.', 'In progress'),
  ('Print queue stuck in Admin office', 'Printing',
   'Documents sent to the Admin office printer stay in the queue and never print. Restarting did not help.', 'Completed');
