console.log("Backup local do PostgreSQL:");
console.log("docker compose exec db pg_dump -U preplab asvab > backup-asvab.sql");
console.log("Restaurar:");
console.log("docker compose exec -T db psql -U preplab asvab < backup-asvab.sql");
