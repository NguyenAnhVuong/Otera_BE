alter table "public"."deceaseds" alter column "dateOfDeath" drop not null;
alter table "public"."deceaseds" add column "dateOfDeath" date;
