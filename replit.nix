{ pkgs }: {
  deps = [
    pkgs.postgresql
    pkgs.postgresql_14
    pkgs.tree
    pkgs.nodejs-18_x
  ];
}