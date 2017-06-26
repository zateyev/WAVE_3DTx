#ifdef GL_FRAGMENT_PRECISION_HIGH
 // highp is supported
 precision highp int;
 precision highp float;
#else
 // high is not supported
 precision mediump int;
 precision mediump float;
#endif

// Passed from vertex
varying vec4 frontColor;
varying vec4 pos;

// Passed from core
uniform sampler2D uBackCoord;
uniform sampler1D uTransferFunction;
uniform sampler3D uSliceMaps;

// Assuming a bounding box of 256x256x256
// ceil( sqrt(3) * 256 ) = 444
const int MAX_STEPS = 444;

// Application specific parameters
uniform float uMinGrayVal;
uniform float uMaxGrayVal;
uniform float uOpacityVal;
uniform float uColorVal;
uniform float uAbsorptionModeIndex;
uniform float uSteps;

// x - R, y - G, z - B
// x - H, y - S, z - V
vec3 hsv2rgb(vec3 hsv)
{
    float     hue, p, q, t, ff;
    int        i;
    //"opacity_factor": 40,
    //"color_factor": 0.4,
    //"x_min": 0,
    //"x_max": 1,
    //"l": 5,
    //"s" : 1,
    //"hMin" : -0.5,
    //"hMax" : 1,
    //"minRefl" : 0,
    //"minSos" : 0,
    //"minAtten" : 0,
    //"maxRefl" : 100,
    //"maxSos" : 100,
    //"maxAtten" : 100,

    float darkness = 0.4;
    float l = 5.0;
    float s = 1.0;
    float hMin = -0.5;
    float hMax = 1.0;

    hsv.z = (darkness - hsv.z) * l;
    hsv.x = (hsv.x - hMin)/(hMax - hMin) * 360.0;
    hsv.y *= s * 1.5;

    hue=hsv.x >= 360.0?hsv.x-360.0:hsv.x;

    hue /= 60.0;
    i = int(hue);
    ff = hue - float(i);
    p = hsv.z * (1.0 - hsv.y);
    q = hsv.z * (1.0 - (hsv.y * ff));
    t = hsv.z * (1.0 - (hsv.y * (1.0 - ff)));

    if(i==0)
        return vec3(hsv.z,t,p);

    else if(i==1)
      return vec3(q,hsv.z,p);

    else if(i==2)
        return vec3(p,hsv.z,t);

    else if(i==3)
        return vec3(p,q,hsv.z);

    else if(i==4)
        return vec3(t,p,hsv.z);

    else
        return vec3(hsv.z,p,q);
}

void main(void) {

    //Transform the coordinates it from [-1;1] to [0;1]
    vec2 texc = vec2(((pos.x / pos.w) + 1.0 ) / 2.0,
                     ((pos.y / pos.w) + 1.0 ) / 2.0);

    //The back position is the world space position stored in the texture.
    vec3 backPos = texture2D(uBackCoord, texc).xyz;

    //The front position is the world space position of the second render pass.
    vec3 frontPos = frontColor.rgb;

    //The direction from the front position to back position.
    vec3 dir = backPos - frontPos;
    float rayLength = length(dir);

    //Calculate how long to increment in each step.
    // float steps = ceil(sqrt(3.0) * 256);
    //float steps = 256.0;
    // float delta = 1.0 / steps;
    float delta = 1.0 / uSteps;

    //The increment in each direction for each step.
    vec3 deltaDirection = normalize(dir) * delta;

    // vec3 Step = dir / steps;
    vec3 Step = dir / uSteps;

    float deltaDirectionLength = length(deltaDirection);


    //vec4 vpos = frontColor;  // currentPosition
    //vec3 Step = dir/uStepsF; // steps

    //Start the ray casting from the front position.
    vec3 currentPosition = frontPos;

    //The color accumulator.
    vec4 accumulatedColor = vec4(0.0);

    //The alpha value accumulated so far.
    float accumulatedAlpha = 0.0;

    //How long has the ray travelled so far.
    float accumulatedLength = 0.0;

    //If we have twice as many samples, we only need ~1/2 the alpha per sample.
    //Scaling by 256/10 just happens to give a good value for the alphaCorrection slider.
    float alphaScaleFactor = 28.8 * delta;

    vec4 colorSample = vec4(0.0);
    vec4 sample = vec4(0.0);
    vec4 grayValue;
    float alphaSample;
    float alphaCorrection = 1.0;

    //Perform the ray marching iterations
    for(int i = 0; i < uSteps; i++) {

        if(currentPosition.x > 1.0 || currentPosition.y > 1.0 || currentPosition.z > 1.0 || currentPosition.x < 0.0 || currentPosition.y < 0.0 || currentPosition.z < 0.0)
            break;
        if(accumulatedColor.a>=1.0)
            break;

        grayValue = texture(uSliceMaps, currentPosition);

        if(grayValue.z < 0.05 ||
           grayValue.x < 0.0 ||
           grayValue.x > 1.0)
            accumulatedColor = vec4(0.0);
        else {
            // colorSample.xyz = grayValue.xyz;

            // colorSample.x = grayValue.x;
            colorSample.x = (grayValue.x - uMinGrayVal) / (uMaxGrayVal - uMinGrayVal);
            colorSample.y = grayValue.y/0.6;
            //colorSample.y = grayValue.y;
            colorSample.z = grayValue.z;
            colorSample.w = 0.05;

            // sample.a = colorSample.a * 40.0 * (1.0 / uSteps);
            //sample.a = colorSample.a;
            sample.a = 1.0 - pow(1.0 - colorSample.a, 200.0f / uSteps);
            sample.rgb = (1.0 - accumulatedColor.a) * hsv2rgb(colorSample.xyz) * sample.a;
            // accumulatedColor.a += (1.0 - accumulatedColor.a) * colorSample.a * uOpacityVal;
            accumulatedColor += sample;

        }

        //Advance the ray.
        //currentPosition.xyz += deltaDirection;
        currentPosition.xyz += Step;


    }
    gl_FragColor = accumulatedColor;
}
