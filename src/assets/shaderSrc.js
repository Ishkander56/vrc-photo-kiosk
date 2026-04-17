export const fullscreenVertex = `#version 300 es

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_texCoord;

out vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position * 2.0, 0.0, 1.0);
    v_texCoord = a_texCoord;
}`;

export const pass2Vertex = `#version 300 es

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_texCoord;

uniform vec2 u_translation;
uniform float u_rotation;
uniform vec2 u_scale;
uniform vec2 u_resolution;
uniform vec2 u_imageSize;

out vec2 v_texCoord;     // for layer (transformed)
out vec2 v_screenUV;     // for backbuffer (stable)

void main() {
    vec2 pos = a_position;

    pos *= u_resolution;

    vec2 norm = pos / u_resolution.y;

    norm *= u_scale;

    float s = sin(u_rotation);
    float c = cos(u_rotation);
    norm = vec2(
        norm.x * c - norm.y * s,
        norm.x * s + norm.y * c
    );

    pos = norm * u_resolution.y;

    pos += u_translation;

    vec2 ndc = (pos / u_resolution) * 2.0 - 1.0;

    gl_Position = vec4(ndc, 0.0, 1.0);

    v_texCoord = a_texCoord;
}`;

export const fullscreenFragment = `#version 300 es
precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_image;

out vec4 outColor;

void main() {
    outColor = texture(u_image, v_texCoord);
}`;

export const pass1Fragment = `#version 300 es
precision highp float;

in vec2 v_texCoord;
uniform sampler2D u_image;

uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;

uniform vec3 u_rgb;

uniform float u_blur;
uniform vec2 u_texelSize;

out vec4 outColor;

float luma(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

vec4 blur(vec2 uv) {
    vec2 o[9] = vec2[](
        vec2(-1,-1), vec2(0,-1), vec2(1,-1),
        vec2(-1, 0), vec2(0, 0), vec2(1, 0),
        vec2(-1, 1), vec2(0, 1), vec2(1, 1)
    );

    float w[9] = float[](
        1.0, 2.0, 1.0,
        2.0, 4.0, 2.0,
        1.0, 2.0, 1.0
    );

    vec3 col = vec3(0.0);
    float a = 0.0;
    float sum = 0.0;

    for (int i = 0; i < 9; i++) {
        vec4 s = texture(u_image, uv + o[i] * u_texelSize * u_blur);
        col += s.rgb * w[i];
        a += s.a * w[i];
        sum += w[i];
    }

    return vec4(col / sum, a / sum);
}

void main() {
    vec2 uv = v_texCoord;

    vec4 tex;

    if (u_blur > 0.0) {
        tex = blur(uv);
    } else {
        tex = texture(u_image, uv);
    }

    vec3 color = tex.rgb;
    float alpha = tex.a;

    color *= u_brightness;

    float l = luma(color);
    color = mix(vec3(l), color, u_saturation);

    color = (color - 0.5) * u_contrast + 0.5;

    color *= u_rgb;

    outColor = vec4(color, alpha);
}`;

export const pass2Fragment = `#version 300 es
precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_layer;

out vec4 outColor;

void main() {
    vec4 col = texture(u_layer, v_texCoord);
    outColor = col;
}`

export const pass3Fragment = `#version 300 es
precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_layer;
uniform float u_opacity;

out vec4 outColor;

void main() {
    vec4 src = texture(u_layer, v_texCoord);
    src.a *= u_opacity;

    outColor = src;
}
`;