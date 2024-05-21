alter table "public"."eventPaticipants"
  add constraint "FK_eb4927cd07d7c7febbf466f7082"
  foreign key ("eventId")
  references "public"."events"
  ("id") on update no action on delete no action;
