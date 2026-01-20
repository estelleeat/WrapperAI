-- 1. Activer l'extension vector
create extension if not exists vector;

-- 2. Créer la table des documents
-- Note: On utilise 768 dimensions pour le modèle Google text-embedding-004
create table if not exists documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(768)
);

-- 3. Fonction de recherche par similarité
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
