#!/usr/bin/env python3

import os

PATH = os.environ.get(
    "EARTH_FIX_PATH",
    "/run/media/lulonaut/NVME/SteamLibrary/steamapps/common/X-Plane 12/Custom Data/earth_fix.dat",
)
OUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "wordle/src/guesses_5.ts")
WRITE_OUTPUT = True

# Manually added waypoints that are not in the German (ED) region.
CUSTOM_WAYPOINTS = {"gemix"}


def find_waypoints(path):
    with open(path, "r") as f:
        lines = f.readlines()[3:]

    waypoints = set(CUSTOM_WAYPOINTS)
    for line in lines:
        parts = line.split()
        if len(parts) < 5:
            continue
        name, region, code = parts[2], parts[3], parts[4]
        if code == "ED" and len(name) == 5 and name.isalpha():
            waypoints.add(name.lower())
    return sorted(CUSTOM_WAYPOINTS) + sorted(waypoints - CUSTOM_WAYPOINTS)


def to_typescript(waypoints):
    entries = ",\n".join(f'    "{w}"' for w in waypoints)
    return (
        "const guesses = [\n"
        f"{entries}\n"
        "];\n"
        "export default guesses;\n"
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
