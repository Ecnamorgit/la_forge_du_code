import os
from PIL import Image

def clean_checkerboard(img, tolerance=30):
    # Ensure RGBA
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()

    # Collect border colors
    bg_colors = set()
    border_depth = 3
    for d in range(border_depth):
        for x in range(w):
            bg_colors.add(pixels[x, d][:3])
            bg_colors.add(pixels[x, h - 1 - d][:3])
        for y in range(h):
            bg_colors.add(pixels[d, y][:3])
            bg_colors.add(pixels[w - 1 - d, y][:3])

    bg_colors = {c for c in bg_colors if c != (0, 0, 0)}

    def is_bg_color(color):
        r1, g1, b1 = color[:3]
        for r2, g2, b2 in bg_colors:
            if abs(r1 - r2) <= tolerance and abs(g1 - g2) <= tolerance and abs(b1 - b2) <= tolerance:
                max_diff = max(r1, g1, b1) - min(r1, g1, b1)
                if max_diff < 25:
                    return True
        return False

    # Standard flood-fill from borders
    from collections import deque
    queue = deque()
    visited = set()
    for x in range(w):
        queue.append((x, 0))
        queue.append((x, h-1))
        visited.add((x, 0))
        visited.add((x, h-1))
    for y in range(h):
        queue.append((0, y))
        queue.append((w-1, y))
        visited.add((0, y))
        visited.add((w-1, y))

    background_pixels = set()
    while queue:
        cx, cy = queue.popleft()
        color = pixels[cx, cy]
        if is_bg_color(color):
            background_pixels.add((cx, cy))
            for nx, ny in [(cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)]:
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))

    for x, y in background_pixels:
        pixels[x, y] = (0, 0, 0, 0)

    return img

def main():
    brain_dir = "C:/Users/joan7/.gemini/antigravity/brain/22e4e1e8-22d7-4994-8aba-a7a4b229f5e1"
    dest_path = "C:/dev/formation/fil-rouge/codeforge/public/sprites/mission-icons-v2.png"

    # Strict order of course slugs
    course_order = [
        "html", "css", "javascript", "react", "typescript",
        "git", "sql", "nodejs", "tests", "devops",
        "mongodb", "security", "python", "algo"
    ]

    # Map slugs to the generated file name in the brain directory (once they exist)
    # We will search the brain directory dynamically for files matching these names
    files_in_brain = os.listdir(brain_dir)

    # Spritesheet configuration
    cols = 8
    rows = 4
    frame_size = 32
    sheet_w = cols * frame_size # 256
    sheet_h = rows * frame_size # 128

    spritesheet = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))

    for i, slug in enumerate(course_order):
        # Find the generated file in the brain directory for this slug
        matching_file = None
        prefix = slug
        if slug == "javascript":
            prefix = "js"
        elif slug == "typescript":
            prefix = "ts"
            
        for f in files_in_brain:
            if f.startswith(f"{prefix}_logo_pixel") and f.endswith(".png"):
                matching_file = f
                break

        if not matching_file:
            print(f"Warning: No generated file found for {slug}. Placing a blank frame.")
            continue

        src_path = os.path.join(brain_dir, matching_file)
        print(f"Processing frame {i} ({slug}) from {matching_file}...")

        # Open, clean checkerboard, and resize using NEAREST to keep it sharp
        img = Image.open(src_path)
        cleaned_img = clean_checkerboard(img)
        resized_img = cleaned_img.resize((frame_size, frame_size), Image.Resampling.NEAREST)

        # Calculate coordinates
        col = i % cols
        row = i // cols
        x = col * frame_size
        y = row * frame_size

        # Paste onto spritesheet
        spritesheet.paste(resized_img, (x, y))

    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    spritesheet.save(dest_path, "PNG")
    print(f"Successfully compiled spritesheet at {dest_path}")

if __name__ == "__main__":
    main()
