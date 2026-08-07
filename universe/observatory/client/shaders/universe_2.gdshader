shader_type canvas_item;

uniform vec4 bg_color: source_color;
uniform vec2 offset;
uniform float bigStarSlow = 2.0;
uniform float mediumStarSlow = 6.0;
uniform float smallStarSlow = 8.0;

uniform float smallStarAmount = 0.002;
uniform float mediumStarAmount = 0.01;
uniform float bigStarAmount = 0.02;

float rand(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void fragment() {
	vec2 normCoordBig = FRAGCOORD.xy+floor(offset/bigStarSlow);
	vec2 normCoordMedium = FRAGCOORD.xy+floor(offset/mediumStarSlow);
	vec2 normCoordSmall = FRAGCOORD.xy+floor(offset/smallStarSlow);
	
	float color = 0.0;
	
	float size = 20.0;
	float prob = 1.0-mediumStarAmount;
	vec2 pos = floor(1.0 / size * normCoordMedium);
	float starValue = rand(pos);

	// Draw medium Stars
	if (starValue > prob)
	{
		vec2 center = size * pos + vec2(size, size) * 0.5;
		float t = 0.9 + 0.2 * sin(TIME * 8.0 + (starValue - prob) / (1.0 - prob) * 45.0);
		color = 1.0 - distance(normCoordMedium.xy, center) / (0.5 * size);
		color = color * t / (abs(normCoordMedium.y - center.y)) * t / (abs(normCoordMedium.x - center.x));
	}
	
	// Draw Big stars
	size = 100.0;
	prob = 1.0-bigStarAmount;
	pos = floor(1.0 / size * normCoordBig);
	starValue = rand(pos);

	if (starValue > prob)
	{
		vec2 center = size * pos + vec2(size, size) * 0.5;
		float t = 0.9 + 0.2 * sin(TIME * 8.0 + (starValue - prob) / (1.0 - prob) * 45.0);
		color = 1.0 - distance(normCoordBig.xy, center) / (0.5 * size);
		color = color * t / (abs(normCoordBig.y - center.y)) * t / (abs(normCoordBig.x - center.x));
	}
	
	// Draw Small stars
	if (rand(normCoordSmall / 20.0) > 1.0-smallStarAmount)
	{
		float r = rand(normCoordSmall);
		color = r * (0.85 * sin(TIME * (r * 5.0) + 720.0 * r) + 0.95);
	}
	COLOR = vec4(vec3(color),color) + bg_color;
}