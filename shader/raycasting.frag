#version 400

in vec4 frontColor; // vec3
in vec4 pos;
// in vec4 ExitPointCoord;

uniform sampler2D uBackCoord;
uniform sampler3D uSliceMaps;
uniform sampler1D uTransferFunction;
uniform float     uSteps;
uniform float uMinGrayVal;
uniform float uMaxGrayVal;
uniform float uOpacityVal;
// uniform vec2      ScreenSize;
// layout (location = 0) out vec4 FragColor;

void main()
{
    vec2 texC = ((pos.xy/pos.w) + 1.0) / 2.0;
    vec3 backColor = texture(uBackCoord, texC).xyz;
    // vec3 backColor = texture(uBackCoord, gl_FragCoord.st/ScreenSize).xyz;

    // that will actually give you clip-space coordinates rather than
    // normalised device coordinates, since you're not performing the perspective
    // division which happens during the rasterisation process (between the vertex
    // shader and fragment shader
    // vec2 exitFragCoord = (ExitPointCoord.xy / ExitPointCoord.w + 1.0)/2.0;
    // vec3 backColor  = texture(uBackCoord, exitFragCoord).xyz;
    if (frontColor.rgb == backColor)
    	//background need no raycasting
    	discard;
    vec3 dir = backColor - frontColor.rgb;
    float len = length(dir); // the length from front to back is calculated and used to terminate the ray
    vec3 deltaDir = normalize(dir) / uSteps;
    // vec3 deltaDir = dir/uSteps;
    float deltaDirLen = length(deltaDir);
    vec3 voxelCoord = frontColor.rgb;
    vec4 colorAcum = vec4(0.0); // The dest color
    float alphaAcum = 0.0;                // The  dest alpha for blending
    float intensity;
    float lengthAcum = 0.0;
    vec4 colorSample; // The src color
    float alphaSample; // The src alpha
    // backgroundColor
    vec4 bgColor = vec4(0.0, 0.0, 0.0, 0.0);

    for(int i = 0; i < 1600; i++)
    {
    	// intensity =  texture(uSliceMaps, voxelCoord).x;
      intensity =  (texture(uSliceMaps, voxelCoord).x - uMinGrayVal) / (uMaxGrayVal - uMinGrayVal);
    	colorSample = texture(uTransferFunction, intensity);
    	// modulate the value of colorSample.a
    	// front-to-back integration
    	if (colorSample.a > 0.0) {
    	    // accomodate for variable sampling rates (base interval defined by mod_compositing.frag)

    	    colorSample.a = 1.0 - pow(1.0 - colorSample.a, 200.0f / uSteps);
    	    colorAcum.rgb += (1.0 - colorAcum.a) * colorSample.rgb * colorSample.a;
    	    colorAcum.a += (1.0 - colorAcum.a) * colorSample.a * uOpacityVal;
    	}
    	voxelCoord += deltaDir;
    	lengthAcum += deltaDirLen;
    	if (lengthAcum >= len )
    	{
    	    colorAcum.rgb = colorAcum.rgb*colorAcum.a + (1 - colorAcum.a)*bgColor.rgb;
    	    break;  // terminate if opacity > 1 or the ray is outside the volume
    	}
    	else if (colorAcum.a > 1.0)
    	{
    	    colorAcum.a = 1.0;
    	    break;
    	}
    }
    // FragColor = colorAcum;
    gl_FragColor = colorAcum;

    // for test
    // gl_FragColor = vec4(frontColor.rgb, 1.0);
    // gl_FragColor = vec4(backColor, 1.0);

}
