{
  description = "animations";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            nodejs_22
            lsof
            ffmpeg
            # Native canvas dependencies + build tools
            pkg-config
            cairo
            pango
            harfbuzz
            freetype
            fontconfig
            pixman
            glib
            libuuid
          ];

          shellHook = ''
            # Point pkg-config to Nix store libraries so node-gyp compiles correctly
            export PKG_CONFIG_PATH="${
              pkgs.lib.makeSearchPath "lib/pkgconfig" [
                pkgs.cairo
                pkgs.pango
                pkgs.harfbuzz
                pkgs.freetype
                pkgs.fontconfig
                pkgs.pixman
                pkgs.glib
                pkgs.libuuid
              ]
            }:$PKG_CONFIG_PATH"

            # Ensure runtime libraries are found by dynamic linker
            export LD_LIBRARY_PATH="${
              pkgs.lib.makeLibraryPath [
                pkgs.cairo
                pkgs.pango
                pkgs.harfbuzz
                pkgs.freetype
                pkgs.fontconfig
                pkgs.pixman
                pkgs.glib
                pkgs.libuuid
              ]
            }:$LD_LIBRARY_PATH"

            bun install
            echo "Bun versie: $(bun --version)"
            echo "Node versie: $(node --version)"
          '';
        };
      }
    );
}
