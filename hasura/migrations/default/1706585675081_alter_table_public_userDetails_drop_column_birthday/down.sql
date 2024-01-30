alter table "public"."userDetails" alter column "birthday" drop not null;
alter table "public"."userDetails" add column "birthday" date;
