-- Add cover_image_url column to deck_archetypes table
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'deck_archetypes' and column_name = 'cover_image_url') then
        alter table deck_archetypes 
        add column cover_image_url text;
    end if;
end $$;
