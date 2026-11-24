-- Removes every sample account and everything they posted or uploaded.
delete from auth.users where email like '%@sample.nexa.invalid';
