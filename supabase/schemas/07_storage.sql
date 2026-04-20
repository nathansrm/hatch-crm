--
-- Storage
-- This file declares storage bucket policies.
-- Phase 2: Hardened with auth.uid() IS NOT NULL check.
--

insert into storage.buckets (id, name, public)
values ('resources', 'resources', false)
on conflict (id) do nothing;

create policy "authenticated_select_attachments" on storage.objects for select to authenticated using (bucket_id = 'attachments' and auth.uid() is not null);
create policy "authenticated_insert_attachments" on storage.objects for insert to authenticated with check (bucket_id = 'attachments' and auth.uid() is not null);
create policy "authenticated_delete_attachments" on storage.objects for delete to authenticated using (bucket_id = 'attachments' and owner_id = auth.uid());

create policy "resources_storage_owner" on storage.objects
    for all using (bucket_id = 'resources' and auth.uid()::text = (storage.foldername(name))[1])
    with check (bucket_id = 'resources' and auth.uid()::text = (storage.foldername(name))[1]);
