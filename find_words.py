#!/usr/bin/env python3

import os

PATH = "/run/media/lulonaut/NVME/XPLANE/X-Plane 12/Custom Data/earth_fix.dat"
OUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "wordle/src/words_5.ts")
WRITE_OUTPUT = True


def find_waypoints(path):
    with open(path, "r") as f:
        lines = f.readlines()[3:]

    waypoints = set()
    for line in lines:
        parts = line.split()
        if len(parts) < 5:
            continue
        name, region, code = parts[2], parts[3], parts[4]
        if code == "ED" and len(name) == 5 and name.isalpha():
            waypoints.add(name.lower())
    return sorted(waypoints)


def to_typescript(waypoints):
    entries = ",\n".join(f'\t\t"{w}"' for w in waypoints)
    return (
        "const words = {\n"
        '\t"words": [\n'
        f"{entries}\n"
        "\t]\n"
        "};\n"
        "export default words;\n"
    )


def main():
    waypoints = find_waypoints(PATH)
    print(f"Found {len(waypoints)} waypoints")

    if WRITE_OUTPUT:
        with open(OUT_PATH, "w") as f:
            f.write(to_typescript(waypoints))
        print(f"Wrote {len(waypoints)} waypoints to {OUT_PATH}")


if __name__ == "__main__":
    main()
