-- this file was manually created
INSERT INTO public.users (display_name, handle, email, cognito_user_id)
VALUES
  ('Andrew Brown', 'andrewbrown' , 'test@email.com', 'MOCK'),
  ('ariansyah', 'ariansyahy' , 'ariansyahy@yahoo.com', 'MOCK'),
  ('Andrew Bayko', 'bayko' , 'ghurafa2821@gmail.com' , 'MOCK'),
  ('lando', 'lando' , 'lando@gmail.com' , 'MOCK');

INSERT INTO public.activities (user_uuid, message, expires_at)
VALUES
  (
    (SELECT uuid from public.users WHERE users.handle = 'ariansyahy' LIMIT 1),
    'This was imported as seed data!',
    current_timestamp + interval '10 day'
  )