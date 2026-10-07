#!/bin/sh

# Generate TinaCMS Block Preview Images - Stichting Inspiringtheater Wageningen
# Nature-focused, illustrative design with brand colors

set -e

# Detect ImageMagick version and set command
if command -v magick >/dev/null 2>&1; then
    MAGICK_CMD="magick"
    echo "✅ Found ImageMagick v7+ (using 'magick' command)"
elif command -v convert >/dev/null 2>&1; then
    MAGICK_CMD="convert"
    echo "✅ Found ImageMagick v6 (using 'convert' command)"
else
    echo "❌ ImageMagick not found. Please install it:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   CentOS/RHEL: sudo yum install ImageMagick"
    exit 1
fi

# Create blocks directory
BLOCKS_DIR="public/blocks"
mkdir -p "$BLOCKS_DIR"
echo "📁 Created directory: $BLOCKS_DIR"

# Image dimensions
WIDTH=400
HEIGHT=300

# Brand Color Palette - Stichting Inspiringtheater Wageningen
get_color() {
    case "$1" in
        "dark-green")    echo "#387630" ;;  # Primary green
        "medium-green")  echo "#51A037" ;;  # Medium green
        "bright-green")  echo "#69A851" ;;  # Bright green
        "light-green")   echo "#85CE6A" ;;  # Light green
        "dark-orange")   echo "#EE712D" ;;  # Primary orange
        "medium-orange") echo "#EF7E33" ;;  # Medium orange
        "light-orange")  echo "#F1874D" ;;  # Light orange
        "black")         echo "#000000" ;;  # Black
        "dark-gray")     echo "#222320" ;;  # Dark gray
        "medium-gray")   echo "#474742" ;;  # Medium gray
        "light-gray")    echo "#CCCECC" ;;  # Light gray
        "pale-gray")     echo "#F0F2F0" ;;  # Pale gray
        "white")         echo "#FFFFFF" ;;  # White
        *)               echo "#387630" ;;  # Default to primary green
    esac
}

# Test ImageMagick with a simple command first
echo "🔧 Testing ImageMagick..."
$MAGICK_CMD -size 100x100 xc:red /tmp/test.png 2>/dev/null || {
    echo "❌ ImageMagick test failed. There might be a configuration issue."
    exit 1
}
rm -f /tmp/test.png
echo "✅ ImageMagick test passed!"

# Generate Hero Block Preview - Nature landscape style
echo "🎨 Generating hero block preview..."
HERO_BG=$(get_color "light-green")
HERO_ACCENT=$(get_color "dark-green")
HERO_TEXT=$(get_color "white")
$MAGICK_CMD -size ${WIDTH}x${HEIGHT} \
    gradient:"${HERO_BG}-${HERO_ACCENT}" \
    -gravity center \
    -pointsize 36 -font Arial-Bold -fill "$HERO_TEXT" \
    -annotate +0-50 "🌱" \
    -pointsize 28 -font Arial-Bold -fill "$HERO_TEXT" \
    -annotate +0-10 "WELCOME" \
    -pointsize 14 -font Arial -fill "$HERO_TEXT" \
    -annotate +0+20 "Inspiring stories about sustainable living" \
    -annotate +0+40 "and our connection to nature" \
    "$BLOCKS_DIR/hero.png"

# Generate Content Block Preview - Article/blog style
echo "📝 Generating content block preview..."
CONTENT_BG=$(get_color "pale-gray")
CONTENT_PRIMARY=$(get_color "medium-green")
CONTENT_TEXT=$(get_color "dark-gray")
$MAGICK_CMD -size ${WIDTH}x${HEIGHT} xc:"$CONTENT_BG" \
    -gravity center \
    -pointsize 32 -font Arial-Bold -fill "$CONTENT_PRIMARY" \
    -annotate +0-90 "📖" \
    -pointsize 20 -font Arial-Bold -fill "$CONTENT_PRIMARY" \
    -annotate +0-50 "STORIES & ARTICLES" \
    -pointsize 12 -font Arial -fill "$CONTENT_TEXT" \
    -annotate +0-20 "Rich text content about sustainable agriculture" \
    -annotate +0-5 "Personal stories from local farmers" \
    -annotate +0+10 "• Community garden initiatives" \
    -annotate +0+25 "• Seasonal growing guides" \
    -annotate +0+40 "• Environmental impact stories" \
    -annotate +0+55 "• Local food system insights" \
    "$BLOCKS_DIR/content.png"

# Generate Features Block Preview - Three nature elements
echo "⭐ Generating features block preview..."
FEATURES_BG=$(get_color "white")
FEATURES_PRIMARY=$(get_color "bright-green")
FEATURES_SECONDARY=$(get_color "medium-orange")
FEATURES_TEXT=$(get_color "dark-gray")
$MAGICK_CMD -size ${WIDTH}x${HEIGHT} xc:"$FEATURES_BG" \
    -gravity center \
    -pointsize 18 -font Arial-Bold -fill "$FEATURES_TEXT" \
    -annotate +0-110 "OUR CORE VALUES" \
    -pointsize 32 -font Arial-Bold -fill "$FEATURES_PRIMARY" \
    -annotate -120-30 "🌿" \
    -annotate +0-30 "🌾" \
    -annotate +120-30 "🌍" \
    -pointsize 12 -font Arial-Bold -fill "$FEATURES_TEXT" \
    -annotate -120+0 "Sustainability" \
    -annotate +0+0 "Community" \
    -annotate +120+0 "Stewardship" \
    -pointsize 10 -font Arial -fill "$FEATURES_TEXT" \
    -annotate -120+20 "Caring for our" \
    -annotate -120+35 "environment" \
    -annotate +0+20 "Growing together" \
    -annotate +0+35 "as neighbors" \
    -annotate +120+20 "Protecting land" \
    -annotate +120+35 "for future" \
    "$BLOCKS_DIR/features.png"

# Generate Testimonial Block Preview - Community voice
echo "💬 Generating testimonial block preview..."
TESTIMONIAL_BG=$(get_color "light-orange")
TESTIMONIAL_ACCENT=$(get_color "dark-orange")
TESTIMONIAL_TEXT=$(get_color "dark-gray")
$MAGICK_CMD -size ${WIDTH}x${HEIGHT} xc:"$TESTIMONIAL_BG" \
    -gravity center \
    -pointsize 48 -font Arial-Bold -fill "$TESTIMONIAL_ACCENT" \
    -annotate -150-40 "\"" \
    -pointsize 15 -font Arial-Italic -fill "$TESTIMONIAL_TEXT" \
    -annotate +0-25 "The community garden has brought" \
    -annotate +0-5 "our neighborhood closer together" \
    -annotate +0+15 "and taught us so much about" \
    -annotate +0+35 "growing our own food." \
    -pointsize 12 -font Arial-Bold -fill "$TESTIMONIAL_ACCENT" \
    -annotate +0+65 "— Maria, Community Gardener" \
    "$BLOCKS_DIR/testimonial.png"

# Generate Video Block Preview - Educational content
echo "🎬 Generating video block preview..."
VIDEO_BG=$(get_color "dark-gray")
VIDEO_ACCENT=$(get_color "medium-orange")
VIDEO_TEXT=$(get_color "white")
$MAGICK_CMD -size ${WIDTH}x${HEIGHT} xc:"$VIDEO_BG" \
    -gravity center \
    -pointsize 48 -font Arial-Bold -fill "$VIDEO_ACCENT" \
    -annotate +0-30 "▶" \
    -pointsize 16 -font Arial-Bold -fill "$VIDEO_TEXT" \
    -annotate +0+20 "EDUCATIONAL VIDEOS" \
    -pointsize 11 -font Arial -fill "$VIDEO_TEXT" \
    -annotate +0+45 "Farm tours • Workshops • Documentaries" \
    -annotate +0+65 "Seasonal guides • Community events" \
    "$BLOCKS_DIR/video.png"

# Generate Callout Block Preview - Seasonal announcement
echo "📢 Generating callout block preview..."
CALLOUT_BG=$(get_color "bright-green")
CALLOUT_TEXT=$(get_color "white")
CALLOUT_ACCENT=$(get_color "light-orange")
$MAGICK_CMD -size ${WIDTH}x${HEIGHT} xc:"$CALLOUT_BG" \
    -gravity center \
    -pointsize 28 -font Arial-Bold -fill "$CALLOUT_TEXT" \
    -annotate -130+0 "🌻" \
    -pointsize 18 -font Arial-Bold -fill "$CALLOUT_TEXT" \
    -annotate +0-15 "SPRING PLANTING SEASON" \
    -pointsize 12 -font Arial -fill "$CALLOUT_TEXT" \
    -annotate +0+10 "Join our community planting day" \
    -annotate +0+30 "April 15th • Community Garden" \
    "$BLOCKS_DIR/callout.png"

# Generate Stats Block Preview - Impact metrics
echo "📊 Generating stats block preview..."
STATS_BG=$(get_color "pale-gray")
STATS_PRIMARY=$(get_color "dark-green")
STATS_TEXT=$(get_color "dark-gray")
$MAGICK_CMD -size ${WIDTH}x${HEIGHT} xc:"$STATS_BG" \
    -gravity center \
    -pointsize 16 -font Arial-Bold -fill "$STATS_TEXT" \
    -annotate +0-90 "COMMUNITY IMPACT" \
    -pointsize 28 -font Arial-Bold -fill "$STATS_PRIMARY" \
    -annotate -100-30 "150" \
    -annotate +0-30 "25" \
    -annotate +100-30 "5K" \
    -pointsize 11 -font Arial -fill "$STATS_TEXT" \
    -annotate -100+0 "Families" \
    -annotate +0+0 "Gardens" \
    -annotate +100+0 "Meals" \
    -pointsize 9 -font Arial -fill "$STATS_TEXT" \
    -annotate -100+20 "participating" \
    -annotate -100+35 "in program" \
    -annotate +0+20 "maintained by" \
    -annotate +0+35 "volunteers" \
    -annotate +100+20 "shared with" \
    -annotate +100+35 "community" \
    "$BLOCKS_DIR/stats.png"

# Generate CTA Block Preview - Action invitation
echo "🎯 Generating CTA block preview..."
CTA_BG=$(get_color "light-green")
CTA_PRIMARY=$(get_color "dark-green")
CTA_SECONDARY=$(get_color "medium-orange")
CTA_TEXT=$(get_color "dark-gray")
$MAGICK_CMD -size ${WIDTH}x${HEIGHT} xc:"$CTA_BG" \
    -gravity center \
    -pointsize 24 -font Arial-Bold -fill "$CTA_PRIMARY" \
    -annotate +0-50 "GET INVOLVED" \
    -pointsize 13 -font Arial -fill "$CTA_TEXT" \
    -annotate +0-20 "Join our sustainable living community" \
    -annotate +0-5 "and make a positive impact together" \
    -pointsize 14 -font Arial-Bold -fill "$CTA_PRIMARY" \
    -annotate -60+30 "VOLUNTEER" \
    -pointsize 14 -font Arial-Bold -fill "$CTA_SECONDARY" \
    -annotate +60+30 "LEARN MORE" \
    -pointsize 24 -font Arial-Bold -fill "$CTA_SECONDARY" \
    -annotate +0+65 "🌱 🤝 🌍" \
    "$BLOCKS_DIR/cta.png"

# Generate Image-Text Block Preview - Story format
echo "🖼️ Generating image-text block preview..."
IMAGETEXT_BG=$(get_color "white")
IMAGETEXT_PRIMARY=$(get_color "medium-green")
IMAGETEXT_ACCENT=$(get_color "light-orange")
IMAGETEXT_TEXT=$(get_color "dark-gray")
$MAGICK_CMD -size ${WIDTH}x${HEIGHT} xc:"$IMAGETEXT_BG" \
    -gravity center \
    -pointsize 64 -font Arial-Bold -fill "$IMAGETEXT_PRIMARY" \
    -annotate -100+0 "🥕" \
    -pointsize 18 -font Arial-Bold -fill "$IMAGETEXT_PRIMARY" \
    -annotate +60-50 "FARM STORIES" \
    -pointsize 11 -font Arial -fill "$IMAGETEXT_TEXT" \
    -annotate +60-20 "Personal journeys in" \
    -annotate +60-5 "sustainable agriculture" \
    -annotate +60+15 "• Farmer profiles" \
    -annotate +60+30 "• Growing techniques" \
    -annotate +60+45 "• Seasonal wisdom" \
    -pointsize 10 -font Arial-Bold -fill "$IMAGETEXT_ACCENT" \
    -annotate +60+70 "READ STORIES →" \
    "$BLOCKS_DIR/image-text.png"

# Check if all files were created successfully
echo ""
echo "🔍 Verifying generated files..."
success_count=0
total_count=9

for block in hero content features testimonial video callout stats cta image-text; do
    if [ -f "$BLOCKS_DIR/$block.png" ]; then
        size=$(ls -l "$BLOCKS_DIR/$block.png" | awk '{print $5}')
        echo "   ✅ $block.png (${size} bytes)"
        success_count=$((success_count + 1))
    else
        echo "   ❌ $block.png - FAILED TO CREATE"
    fi
done

echo ""
if [ $success_count -eq $total_count ]; then
    echo "🎉 SUCCESS! All $total_count nature-themed block previews created!"
else
    echo "⚠️  Created $success_count out of $total_count images"
fi

echo ""
echo "📍 Images saved to: $BLOCKS_DIR/"
echo "🌱 Nature-focused preview images are ready for TinaCMS!"
echo "🎨 Using Stichting Inspiringtheater Wageningen brand colors"

# Create an enhanced HTML preview file with nature theme
echo ""
echo "🌐 Creating nature-themed HTML preview gallery..."
cat > "$BLOCKS_DIR/preview.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TinaCMS Block Previews - Stichting Inspiringtheater Wageningen</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Myriad Variable Concept", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #85CE6A 0%, #387630 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
        }
        .logo-area {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
        }
        .logo-circle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #EE712D, #F1874D);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            position: relative;
        }
        .logo-circle::before {
            content: "🌱";
            position: absolute;
        }
        h1 {
            color: white;
            font-size: 2.2rem;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .org-name {
            color: #222320;
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .subtitle {
            color: rgba(255,255,255,0.95);
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }
        .success-banner {
            background: rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            color: white;
            text-align: center;
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 30px;
            font-weight: 500;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .color-palette {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .color-swatch {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            border: 2px solid rgba(255,255,255,0.3);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
        }
        .block {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            border: 1px solid #F0F2F0;
        }
        .block:hover {
            transform: translateY(-8px);
            box-shadow: 0 16px 40px rgba(0,0,0,0.2);
        }
        .block img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            display: block;
        }
        .block-info {
            padding: 20px;
        }
        .block h3 {
            font-size: 1.2rem;
            color: #222320;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
        }
        .block p {
            color: #474742;
            font-size: 0.9rem;
            line-height: 1.6;
        }
        .badge {
            display: inline-block;
            background: linear-gradient(135deg, #387630, #51A037);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
            margin-top: 12px;
        }
        .nature-badge {
            background: linear-gradient(135deg, #EE712D, #EF7E33);
        }
        .stats {
            margin-top: 3rem;
            text-align: center;
            color: rgba(255,255,255,0.95);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background: rgba(255,255,255,0.15);
            border-radius: 12px;
            padding: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .stat-number {
            font-size: 1.8rem;
            font-weight: bold;
            color: white;
        }
        .stat-label {
            font-size: 0.85rem;
            opacity: 0.9;
            margin-top: 4px;
        }
        @media (max-width: 768px) {
            .grid { grid-template-columns: 1fr; }
            h1 { font-size: 1.8rem; }
            .logo-area { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-area">
                <div class="logo-circle"></div>
                <div>
                    <div class="org-name">Stichting Inspiringtheater</div>
                    <div style="color: #222320; font-size: 1rem;">Wageningen</div>
                </div>
            </div>
            <h1>🎨 TinaCMS Block Previews</h1>
            <p class="subtitle">Nature-focused content blocks for sustainable storytelling</p>

            <div class="color-palette">
                <div class="color-swatch" style="background: #000000;" title="Black"></div>
                <div class="color-swatch" style="background: #222320;" title="Dark Gray"></div>
                <div class="color-swatch" style="background: #474742;" title="Medium Gray"></div>
                <div class="color-swatch" style="background: #387630;" title="Dark Green"></div>
                <div class="color-swatch" style="background: #51A037;" title="Medium Green"></div>
                <div class="color-swatch" style="background: #69A851;" title="Bright Green"></div>
                <div class="color-swatch" style="background: #85CE6A;" title="Light Green"></div>
                <div class="color-swatch" style="background: #EE712D;" title="Dark Orange"></div>
                <div class="color-swatch" style="background: #EF7E33;" title="Medium Orange"></div>
                <div class="color-swatch" style="background: #F1874D;" title="Light Orange"></div>
                <div class="color-swatch" style="background: #CCCECC;" title="Light Gray"></div>
                <div class="color-swatch" style="background: #F0F2F0;" title="Pale Gray"></div>
                <div class="color-swatch" style="background: #FFFFFF; border-color: #CCCECC;" title="White"></div>
            </div>
        </div>

        <div class="success-banner">
            ✅ All 9 nature-themed block preview images generated with your brand colors!
        </div>

        <div class="grid">
            <div class="block">
                <img src="hero.png" alt="Hero block preview">
                <div class="block-info">
                    <h3>🌱 Hero Section</h3>
                    <p>Welcome visitors with inspiring messages about sustainable living and your connection to nature.</p>
                    <span class="badge">Landing Pages</span>
                </div>
            </div>
            <div class="block">
                <img src="content.png" alt="Content block preview">
                <div class="block-info">
                    <h3>📖 Stories & Articles</h3>
                    <p>Share rich stories about sustainable agriculture, community gardens, and environmental stewardship.</p>
                    <span class="badge">Content</span>
                </div>
            </div>
            <div class="block">
                <img src="features.png" alt="Features block preview">
                <div class="block-info">
                    <h3>🌿 Core Values</h3>
                    <p>Highlight your organization's commitment to sustainability, community building, and environmental care.</p>
                    <span class="badge nature-badge">Values</span>
                </div>
            </div>
            <div class="block">
                <img src="testimonial.png" alt="Testimonial block preview">
                <div class="block-info">
                    <h3>💬 Community Voices</h3>
                    <p>Share authentic stories and testimonials from community members, farmers, and participants.</p>
                    <span class="badge">Community</span>
                </div>
            </div>
            <div class="block">
                <img src="video.png" alt="Video block preview">
                <div class="block-info">
                    <h3>🎬 Educational Content</h3>
                    <p>Embed farm tours, workshops, documentaries, and seasonal guides to educate and inspire.</p>
                    <span class="badge nature-badge">Media</span>
                </div>
            </div>
            <div class="block">
                <img src="callout.png" alt="Callout block preview">
                <div class="block-info">
                    <h3>📢 Seasonal Updates</h3>
                    <p>Announce planting seasons, community events, workshops, and important agricultural milestones.</p>
                    <span class="badge">Announcements</span>
                </div>
            </div>
            <div class="block">
                <img src="stats.png" alt="Stats block preview">
                <div class="block-info">
                    <h3>📊 Community Impact</h3>
                    <p>Showcase meaningful metrics about families served, gardens maintained, and community meals shared.</p>
                    <span class="badge nature-badge">Impact</span>
                </div>
            </div>
            <div class="block">
                <img src="cta.png" alt="CTA block preview">
                <div class="block-info">
                    <h3>🤝 Get Involved</h3>
                    <p>Invite community members to volunteer, learn, and participate in sustainable living initiatives.</p>
                    <span class="badge">Engagement</span>
                </div>
            </div>
            <div class="block">
                <img src="image-text.png" alt="Image-Text block preview">
                <div class="block-info">
                    <h3>🥕 Farm Stories</h3>
                    <p>Combine beautiful images with personal narratives about farming, growing, and sustainable practices.</p>
                    <span class="badge nature-badge">Stories</span>
                </div>
            </div>
        </div>

        <div class="stats">
            <h2 style="margin-bottom: 20px; font-size: 1.5rem;">🌾 Design Details</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">9</div>
                    <div class="stat-label">Block Types</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">13</div>
                    <div class="stat-label">Brand Colors</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">400×300</div>
                    <div class="stat-label">Image Size</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">🌱</div>
                    <div class="stat-label">Nature Focus</div>
                </div>
            </div>
            <p style="margin-top: 20px; opacity: 0.9; font-size: 0.9rem;">
                Ready to inspire sustainable living through beautiful content!
            </p>
        </div>
    </div>
</body>
</html>
EOF

echo "🌐 Nature-themed preview gallery created: $BLOCKS_DIR/preview.html"
echo "   Open it in your browser to see all previews with your brand colors!"
echo ""
echo "🚀 Next steps:"
echo "   1. Restart your dev server: npm run dev"
echo "   2. Go to /admin to see the beautiful new preview images"
echo "   3. Open public/blocks/preview.html to view the gallery"
echo ""
echo "🌱 Your sustainable storytelling blocks are ready to inspire!"
