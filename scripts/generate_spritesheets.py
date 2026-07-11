import os
from PIL import Image, ImageDraw

# Colors
CYAN = (0, 240, 255, 255)
ORANGE = (255, 107, 44, 255)
VERT = (0, 255, 136, 255)
VIOLET = (176, 103, 255, 255)
GOLD = (255, 200, 68, 255)
DARK = (10, 22, 40, 255)
WHITE = (255, 255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)

# Colors list to alternate combinations
PRIMARY_COLORS = [CYAN, ORANGE, VERT, VIOLET, GOLD]
ACCENT_COLORS = [GOLD, CYAN, VIOLET, VERT, ORANGE]

def draw_plate(draw, plate_type, primary):
    """Draws a base plate / crest on a 16x16 canvas."""
    if plate_type == 0:  # Circle
        draw.ellipse([1, 1, 14, 14], fill=primary)
        draw.ellipse([2, 2, 13, 13], fill=DARK)
    elif plate_type == 1:  # Shield
        draw.polygon([(8, 1), (14, 3), (14, 9), (8, 14), (2, 9), (2, 3)], fill=primary)
        draw.polygon([(8, 2), (13, 4), (13, 8), (8, 13), (3, 8), (3, 4)], fill=DARK)
    elif plate_type == 2:  # Diamond
        draw.polygon([(8, 1), (14, 8), (8, 14), (2, 8)], fill=primary)
        draw.polygon([(8, 2), (13, 8), (8, 13), (3, 8)], fill=DARK)
    elif plate_type == 3:  # Hexagon
        draw.polygon([(5, 1), (11, 1), (14, 8), (11, 15), (5, 15), (2, 8)], fill=primary)
        draw.polygon([(5, 2), (11, 2), (13, 8), (11, 14), (5, 14), (3, 8)], fill=DARK)

def draw_icon(draw, icon_type, accent):
    """Draws the central glyph inside the 16x16 badge."""
    if icon_type == 0:  # Star
        draw.line([(8, 4), (8, 12)], fill=accent, width=1)
        draw.line([(4, 8), (12, 8)], fill=accent, width=1)
        draw.point([(7, 7), (7, 9), (9, 7), (9, 9)], fill=accent)
    elif icon_type == 1:  # Cross
        draw.line([(8, 4), (8, 12)], fill=accent, width=2)
        draw.line([(4, 8), (12, 8)], fill=accent, width=2)
    elif icon_type == 2:  # Lightning
        draw.polygon([(8, 4), (6, 8), (9, 8), (7, 12), (10, 8), (7, 8)], fill=accent)
    elif icon_type == 3:  # Gear
        draw.ellipse([5, 5, 11, 11], fill=accent)
        draw.ellipse([7, 7, 9, 9], fill=DARK)
        draw.point([(8, 4), (8, 12), (4, 8), (12, 8), (5, 5), (11, 11), (5, 11), (11, 5)], fill=accent)
    elif icon_type == 4:  # Check
        draw.line([(5, 8), (7, 10)], fill=accent, width=1)
        draw.line([(7, 10), (11, 5)], fill=accent, width=1)
    elif icon_type == 5:  # Book
        draw.rectangle([5, 5, 11, 11], fill=accent)
        draw.line([(8, 5), (8, 11)], fill=DARK, width=1)
    elif icon_type == 6:  # Key
        draw.ellipse([6, 4, 10, 8], fill=accent)
        draw.ellipse([7, 5, 9, 7], fill=DARK)
        draw.line([(8, 8), (8, 12)], fill=accent, width=1)
        draw.point([(9, 10), (9, 12)], fill=accent)
    elif icon_type == 7:  # Floppy
        draw.rectangle([5, 5, 11, 11], fill=accent)
        draw.rectangle([7, 9, 9, 11], fill=DARK)
        draw.rectangle([7, 5, 9, 7], fill=WHITE)
    elif icon_type == 8:  # Heart
        draw.polygon([(8, 11), (5, 8), (5, 6), (7, 5), (8, 6), (9, 5), (11, 6), (11, 8)], fill=accent)
        draw.point([(8, 7)], fill=DARK)
    elif icon_type == 9:  # Leaf
        draw.line([(5, 11), (11, 5)], fill=accent, width=1)
        draw.polygon([(6, 8), (7, 6), (9, 5), (10, 7), (8, 9)], fill=accent)
    elif icon_type == 10:  # Shield (Tiny)
        draw.polygon([(8, 5), (11, 6), (11, 9), (8, 11), (5, 9), (5, 6)], fill=accent)
        draw.polygon([(8, 6), (10, 7), (10, 8), (8, 10), (6, 8), (6, 7)], fill=DARK)
    elif icon_type == 11:  # Crescent Moon
        draw.ellipse([5, 5, 11, 11], fill=accent)
        draw.ellipse([7, 4, 12, 9], fill=DARK)
    elif icon_type == 12:  # Atom/Orbital
        draw.ellipse([6, 6, 10, 10], fill=DARK, outline=accent)
        draw.point([(8, 8)], fill=accent)
        draw.point([(5, 5), (11, 11), (5, 11), (11, 5)], fill=accent)
    elif icon_type == 13:  # Hourglass
        draw.polygon([(5, 5), (11, 5), (8, 8), (5, 11), (11, 11)], fill=accent)
        draw.point([(8, 6), (8, 10)], fill=WHITE)

def draw_banner_glyph(draw, idx, color):
    """Draws a specific vector-ish archetype representation on a 16x16 canvas."""
    if idx == 0:  # Signal / transmission
        draw.line([(8, 3), (8, 13)], fill=color, width=1)
        draw.ellipse([6, 6, 10, 10], fill=TRANSPARENT, outline=color)
        draw.ellipse([4, 4, 12, 12], fill=TRANSPARENT, outline=color)
    elif idx == 1:  # Données / décodage
        draw.rectangle([4, 4, 12, 12], fill=TRANSPARENT, outline=color)
        draw.point([(6, 6), (10, 6), (6, 10), (10, 10), (8, 8)], fill=color)
    elif idx == 2:  # Fonction / engrenage
        draw.ellipse([5, 5, 11, 11], fill=TRANSPARENT, outline=color)
        draw.point([(8, 3), (8, 13), (3, 8), (13, 8), (5, 5), (11, 11), (5, 11), (11, 5)], fill=color)
    elif idx == 3:  # Tableau / stockage
        draw.rectangle([4, 3, 12, 6], fill=TRANSPARENT, outline=color)
        draw.rectangle([4, 8, 12, 11], fill=TRANSPARENT, outline=color)
        draw.rectangle([4, 13, 12, 14], fill=TRANSPARENT, outline=color)
    elif idx == 4:  # Objet / structure
        draw.polygon([(8, 2), (14, 5), (14, 11), (8, 14), (2, 11), (2, 5)], fill=TRANSPARENT, outline=color)
        draw.line([(8, 2), (8, 14)], fill=color, width=1)
        draw.line([(8, 8), (14, 5)], fill=color, width=1)
        draw.line([(8, 8), (2, 5)], fill=color, width=1)
    elif idx == 5:  # DOM / écran
        draw.rectangle([3, 4, 13, 11], fill=TRANSPARENT, outline=color)
        draw.line([(8, 11), (8, 14)], fill=color, width=1)
        draw.line([(6, 14), (10, 14)], fill=color, width=1)
    elif idx == 6:  # Événement / étincelle
        draw.line([(8, 2), (8, 14)], fill=color, width=1)
        draw.line([(2, 8), (14, 8)], fill=color, width=1)
        draw.line([(5, 5), (11, 11)], fill=color, width=1)
        draw.line([(5, 11), (11, 5)], fill=color, width=1)
        draw.rectangle([7, 7, 9, 9], fill=DARK)
    elif idx == 7:  # Async / horloge
        draw.ellipse([3, 3, 13, 13], fill=TRANSPARENT, outline=color)
        draw.line([(8, 8), (8, 5)], fill=color, width=1)
        draw.line([(8, 8), (11, 8)], fill=color, width=1)
    elif idx == 8:  # Réseau / satellite
        draw.ellipse([6, 6, 10, 10], fill=color)
        draw.line([(8, 2), (8, 14)], fill=color, width=1)
        draw.line([(2, 8), (14, 8)], fill=color, width=1)
        draw.point([(3, 3), (13, 3), (3, 13), (13, 13)], fill=color)
    elif idx == 9:  # API / serveur
        draw.rectangle([4, 3, 12, 7], fill=TRANSPARENT, outline=color)
        draw.rectangle([4, 9, 12, 13], fill=TRANSPARENT, outline=color)
        draw.point([(6, 5), (10, 5), (6, 11), (10, 11)], fill=color)
    elif idx == 10:  # Sécurité / bouclier
        draw.polygon([(8, 2), (14, 4), (13, 9), (8, 14), (3, 9), (2, 4)], fill=TRANSPARENT, outline=color)
        draw.line([(8, 5), (8, 11)], fill=color, width=1)
        draw.line([(6, 7), (10, 7)], fill=color, width=1)
    elif idx == 11:  # Déploiement / fusée
        draw.polygon([(8, 2), (11, 7), (11, 12), (8, 10), (5, 12), (5, 7)], fill=color)
        draw.line([(8, 10), (8, 14)], fill=ORANGE, width=1)
    elif idx == 12:  # Base de données
        draw.ellipse([4, 2, 12, 5], fill=TRANSPARENT, outline=color)
        draw.ellipse([4, 7, 12, 10], fill=TRANSPARENT, outline=color)
        draw.ellipse([4, 11, 12, 14], fill=TRANSPARENT, outline=color)
        draw.line([(4, 3), (4, 12)], fill=color, width=1)
        draw.line([(12, 3), (12, 12)], fill=color, width=1)
    elif idx == 13:  # Branche / versioning
        draw.line([(4, 4), (4, 12)], fill=color, width=1)
        draw.line([(4, 8), (10, 8)], fill=color, width=1)
        draw.line([(10, 8), (10, 12)], fill=color, width=1)
        draw.ellipse([3, 3, 5, 5], fill=color)
        draw.ellipse([3, 11, 5, 13], fill=color)
        draw.ellipse([9, 11, 11, 13], fill=color)
    elif idx == 14:  # Test / validation
        draw.ellipse([3, 3, 13, 13], fill=TRANSPARENT, outline=color)
        draw.line([(6, 8), (8, 10)], fill=color, width=1)
        draw.line([(8, 10), (11, 6)], fill=color, width=1)
    elif idx == 15:  # Trophée
        draw.polygon([(5, 3), (11, 3), (10, 8), (8, 10), (6, 8)], fill=color)
        draw.line([(8, 10), (8, 13)], fill=color, width=1)
        draw.line([(6, 13), (10, 13)], fill=color, width=1)

def main():
    sprites_dir = "public/sprites"
    os.makedirs(sprites_dir, exist_ok=True)

    # 1. BADGES (512x384 in final, drawn at 128x96 and upscaled 4x)
    print("Generating badges.png...")
    badges_small = Image.new("RGBA", (128, 96), TRANSPARENT)
    for i in range(44):
        # Frame coordinates on 16x16 grid
        col = i % 8
        row = i // 8
        x = col * 16
        y = row * 16

        # Create temporary cell image
        cell = Image.new("RGBA", (16, 16), TRANSPARENT)
        draw = ImageDraw.Draw(cell)

        # Alternate palette combinations and plates
        primary = PRIMARY_COLORS[i % len(PRIMARY_COLORS)]
        accent = ACCENT_COLORS[i % len(ACCENT_COLORS)]
        plate_type = (i // 5) % 4
        icon_type = i % 14

        draw_plate(draw, plate_type, primary)
        draw_icon(draw, icon_type, accent)

        # Paste cell onto small canvas
        badges_small.paste(cell, (x, y))

    # Resize by 4x using NEAREST to make it clean retro pixel art
    badges_final = badges_small.resize((512, 384), Image.Resampling.NEAREST)
    badges_final.save(os.path.join(sprites_dir, "badges.png"), "PNG")
    print("Badges spritesheet saved successfully at public/sprites/badges.png!")

    # 2. BANNER ICONS (192x192 in final, drawn at 64x64 and upscaled 3x)
    print("Generating banner-icons.png...")
    banners_small = Image.new("RGBA", (64, 64), TRANSPARENT)
    for i in range(16):
        col = i % 4
        row = i // 4
        x = col * 16
        y = row * 16

        cell = Image.new("RGBA", (16, 16), TRANSPARENT)
        draw = ImageDraw.Draw(cell)

        # Alternate primary colors for banners
        color = PRIMARY_COLORS[i % len(PRIMARY_COLORS)]

        draw_banner_glyph(draw, i, color)

        banners_small.paste(cell, (x, y))

    # Resize by 3x to get 48x48 per frame (64x64 canvas * 3 = 192x192)
    banners_final = banners_small.resize((192, 192), Image.Resampling.NEAREST)
    banners_final.save(os.path.join(sprites_dir, "banner-icons.png"), "PNG")
    print("Banner icons spritesheet saved successfully at public/sprites/banner-icons.png!")

if __name__ == "__main__":
    main()
