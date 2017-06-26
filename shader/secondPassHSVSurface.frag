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
uniform int uSetViewMode;

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

vec3 getNormal(vec3 at)
{
    // float xw = 419.0;
    // float yw = 492.0;
    // float zw = 462.0;

    float xw = 256.0;
    float yw = 256.0;
    float zw = 256.0;

    vec3 texpos1;

    float w1 = at.z - floor(at.z);
    float w0 = (at.z - (1.0/zw)) - floor(at.z);
    float w2 = (at.z + (1.0/zw)) - floor(at.z);

    float fx, fy, fz;

    float L0, L1, L2, L3, L4, L5, L6, L7, L8;
    float H0, H1, H2, H3, H4, H5, H6, H7, H8;

    texpos1.z = at.z - 1.0/zw;
    texpos1.x = at.x - 1.0/xw;
    texpos1.y = at.y + 1.0/yw;
    L0 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x + 0.0/xw;
    texpos1.y = at.y + 1.0/yw;
    L1 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x + 1.0/xw;
    texpos1.y = at.y + 1.0/yw;
    L2 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x - 1.0/xw;
    texpos1.y = at.y + 0.0/yw;
    L3 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x + 0.0/xw;
    texpos1.y = at.y + 0.0/yw;
    L4 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x + 1.0/xw;
    texpos1.y = at.y + 0.0/yw;
    L5 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x - 1.0/xw;
    texpos1.y = at.y - 1.0/yw;
    L6 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x + 0.0/xw;
    texpos1.y = at.y - 1.0/yw;
    L7 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x + 1.0/xw;
    texpos1.y = at.y - 1.0/yw;
    L8 = texture(uSliceMaps, texpos1).x;


    texpos1.z = at.z + 1.0/zw;
    texpos1.x = at.x - 1.0/xw;
    texpos1.y = at.y + 1.0/yw;
    H0 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x + 0.0/xw;
    texpos1.y = at.y + 1.0/yw;
    H1 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x + 1.0/xw;
    texpos1.y = at.y + 1.0/yw;
    H2 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x - 1.0/xw;
    texpos1.y = at.y + 0.0/yw;
    H3 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x + 0.0/xw;
    texpos1.y = at.y + 0.0/yw;
    H4 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x + 1.0/xw;
    texpos1.y = at.y + 0.0/yw;
    H5 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x - 1.0/xw;
    texpos1.y = at.y - 1.0/yw;
    H6 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x + 0.0/xw;
    texpos1.y = at.y - 1.0/yw;
    H7 = texture(uSliceMaps, texpos1).x;

    texpos1.x = at.x + 1.0/xw;
    texpos1.y = at.y - 1.0/yw;
    H8 = texture(uSliceMaps, texpos1).x;
    // we need to get interpolation of 2 x points
    // x direction
    // -1 -3 -1   0  0  0   1  3  1
    // -3 -6 -3   0  0  0   3  6  3
    // -1 -3 -1   0  0  0   1  3  1
    // y direction
    //  1  3  1   3  6  3   1  3  1
    //  0  0  0   0  0  0   0  0  0
    // -1 -3 -1  -3 -6 -3  -1 -3 -1
    // z direction
    // -1  0  1   -3  0  3   -1  0  1
    // -3  0  3   -6  0  6   -3  0  3
    // -1  0  1   -3  0  3   -1  0  1

    fx =  ((w0 * (H0 - L0)) + L0) * -1.0;
    fx += ((w1 * (H0 - L0)) + L0) * -3.0;
    fx += ((w2 * (H0 - L0)) + L0) * -1.0;

    fx += ((w0 * (H3 - L3)) + L3) * -3.0;
    fx += ((w1 * (H3 - L3)) + L3) * -6.0;
    fx += ((w2 * (H3 - L3)) + L3) * -3.0;

    fx += ((w0 * (H6 - L6)) + L6) * -1.0;
    fx += ((w1 * (H6 - L6)) + L6) * -3.0;
    fx += ((w2 * (H6 - L6)) + L6) * -1.0;

    fx += ((w0 * (H1 - L1)) + L1) * 0.0;
    fx += ((w1 * (H1 - L1)) + L1) * 0.0;
    fx += ((w2 * (H1 - L1)) + L1) * 0.0;

    fx += ((w0 * (H4 - L4)) + L4) * 0.0;
    fx += ((w1 * (H4 - L4)) + L4) * 0.0;
    fx += ((w2 * (H4 - L4)) + L4) * 0.0;

    fx += ((w0 * (H7 - L7)) + L7) * 0.0;
    fx += ((w1 * (H7 - L7)) + L7) * 0.0;
    fx += ((w2 * (H7 - L7)) + L7) * 0.0;

    fx += ((w0 * (H2 - L2)) + L2) * 1.0;
    fx += ((w1 * (H2 - L2)) + L2) * 3.0;
    fx += ((w2 * (H2 - L2)) + L2) * 1.0;

    fx += ((w0 * (H5 - L5)) + L5) * 3.0;
    fx += ((w1 * (H5 - L5)) + L5) * 6.0;
    fx += ((w2 * (H5 - L5)) + L5) * 3.0;

    fx += ((w0 * (H8 - L8)) + L8) * 1.0;
    fx += ((w1 * (H8 - L8)) + L8) * 3.0;
    fx += ((w2 * (H8 - L8)) + L8) * 1.0;

    fy =  ((w0 * (H0 - L0)) + L0) * 1.0;
    fy += ((w1 * (H0 - L0)) + L0) * 3.0;
    fy += ((w2 * (H0 - L0)) + L0) * 1.0;

    fy += ((w0 * (H3 - L3)) + L3) * 0.0;
    fy += ((w1 * (H3 - L3)) + L3) * 0.0;
    fy += ((w2 * (H3 - L3)) + L3) * 0.0;

    fy += ((w0 * (H6 - L6)) + L6) * -1.0;
    fy += ((w1 * (H6 - L6)) + L6) * -3.0;
    fy += ((w2 * (H6 - L6)) + L6) * -1.0;

    fy += ((w0 * (H1 - L1)) + L1) * 3.0;
    fy += ((w1 * (H1 - L1)) + L1) * 6.0;
    fy += ((w2 * (H1 - L1)) + L1) * 3.0;

    fy += ((w0 * (H4 - L4)) + L4) * 0.0;
    fy += ((w1 * (H4 - L4)) + L4) * 0.0;
    fy += ((w2 * (H4 - L4)) + L4) * 0.0;

    fy += ((w0 * (H7 - L7)) + L7) * -3.0;
    fy += ((w1 * (H7 - L7)) + L7) * -6.0;
    fy += ((w2 * (H7 - L7)) + L7) * -3.0;

    fy += ((w0 * (H2 - L2)) + L2) * 1.0;
    fy += ((w1 * (H2 - L2)) + L2) * 3.0;
    fy += ((w2 * (H2 - L2)) + L2) * 1.0;

    fy += ((w0 * (H5 - L5)) + L5) * 0.0;
    fy += ((w1 * (H5 - L5)) + L5) * 0.0;
    fy += ((w2 * (H5 - L5)) + L5) * 0.0;

    fy += ((w0 * (H8 - L8)) + L8) * -1.0;
    fy += ((w1 * (H8 - L8)) + L8) * -3.0;
    fy += ((w2 * (H8 - L8)) + L8) * -1.0;


    fz =  ((w0 * (H0 - L0)) + L0) * -1.0;
    fz += ((w1 * (H0 - L0)) + L0) * 0.0;
    fz += ((w2 * (H0 - L0)) + L0) * 1.0;

    fz += ((w0 * (H3 - L3)) + L3) * -3.0;
    fz += ((w1 * (H3 - L3)) + L3) * 0.0;
    fz += ((w2 * (H3 - L3)) + L3) * 3.0;

    fz += ((w0 * (H6 - L6)) + L6) * -1.0;
    fz += ((w1 * (H6 - L6)) + L6) * 0.0;
    fz += ((w2 * (H6 - L6)) + L6) * 1.0;

    fz += ((w0 * (H1 - L1)) + L1) * -3.0;
    fz += ((w1 * (H1 - L1)) + L1) * 0.0;
    fz += ((w2 * (H1 - L1)) + L1) * 3.0;

    fz += ((w0 * (H4 - L4)) + L4) * -6.0;
    fz += ((w1 * (H4 - L4)) + L4) * 0.0;
    fz += ((w2 * (H4 - L4)) + L4) * 6.0;

    fz += ((w0 * (H7 - L7)) + L7) * -3.0;
    fz += ((w1 * (H7 - L7)) + L7) * 0.0;
    fz += ((w2 * (H7 - L7)) + L7) * 3.0;

    fz += ((w0 * (H2 - L2)) + L2) * -1.0;
    fz += ((w1 * (H2 - L2)) + L2) * 0.0;
    fz += ((w2 * (H2 - L2)) + L2) * 1.0;

    fz += ((w0 * (H5 - L5)) + L5) * -3.0;
    fz += ((w1 * (H5 - L5)) + L5) * 0.0;
    fz += ((w2 * (H5 - L5)) + L5) * 3.0;

    fz += ((w0 * (H8 - L8)) + L8) * -1.0;
    fz += ((w1 * (H8 - L8)) + L8) * 0.0;
    fz += ((w2 * (H8 - L8)) + L8) * 1.0;
    vec3 n = vec3( fx/27.0 , fy/27.0 , fz/27.0 );
    return n;
}
// returns intensity of reflected ambient lighting
// const vec3 lightColor = vec3(1.0, 0.88, 0.74);
const vec3 u_intensity = vec3(0.1, 0.1, 0.1);
vec3 ambientLighting(const vec3 lightColor)
{
    const vec3 u_matAmbientReflectance = lightColor;
    // const vec3 u_lightAmbientIntensity = vec3(0.6, 0.3, 0.0);
    const vec3 u_lightAmbientIntensity = u_intensity;

    return u_matAmbientReflectance * u_lightAmbientIntensity;
}
// returns intensity of diffuse reflection
vec3 diffuseLighting(in vec3 N, in vec3 L, const vec3 lightColor)
{
    const vec3 u_matDiffuseReflectance = lightColor;
    // const vec3 u_lightDiffuseIntensity = vec3(1.0, 0.5, 0);
    const vec3 u_lightDiffuseIntensity = vec3(0.6, 0.6, 0.6);

    // calculation as for Lambertian reflection
    float diffuseTerm = dot(N, L);
    if (diffuseTerm > 1.0) {
        diffuseTerm = 1.0;
    } else if (diffuseTerm < 0.0) {
        diffuseTerm = 0.0;
    }
    return u_matDiffuseReflectance * u_lightDiffuseIntensity * diffuseTerm;
}
// returns intensity of specular reflection
vec3 specularLighting(in vec3 N, in vec3 L, in vec3 V, const vec3 lightColor)
{
    float specularTerm = 0.0;
    // const vec3 u_lightSpecularIntensity = vec3(0, 1, 0);
    const vec3 u_lightSpecularIntensity = u_intensity;
    const vec3 u_matSpecularReflectance = lightColor;
    const float u_matShininess = 5.0;
   // calculate specular reflection only if
   // the surface is oriented to the light source
   if(dot(N, L) > 0.0)
   {
      // half vector
      // vec3 H = normalize(L + V);
      // specularTerm = pow(dot(N, H), u_matShininess);

      vec3 e = normalize(-V);
      vec3 r = normalize(-reflect(L, N));
      specularTerm = pow(max(dot(r, e), 0.0), u_matShininess);
   }
   return u_matSpecularReflectance * u_lightSpecularIntensity * specularTerm;
}


float beckmannDistribution(float x, float roughness) {
  float NdotH = max(x, 0.0001);
  float cos2Alpha = NdotH * NdotH;
  float tan2Alpha = (cos2Alpha - 1.0) / cos2Alpha;
  float roughness2 = roughness * roughness;
  float denom = 3.141592653589793 * roughness2 * cos2Alpha * cos2Alpha;
  return exp(tan2Alpha / roughness2) / denom;
}

vec3 cookTorranceSpecular(
  vec3 surfaceNormal,
  vec3 lightDirection,
  vec3 viewDirection,
  float roughness,
  float fresnel,
  float k,
  const vec3 lightColor) {

  float VdotN = max(dot(viewDirection, surfaceNormal), 0.0);
  float LdotN = max(dot(lightDirection, surfaceNormal), 0.0);

  //Half angle vector
  vec3 H = normalize(lightDirection + viewDirection);

  //Geometric term
  float NdotH = max(dot(surfaceNormal, H), 0.0);
  float VdotH = max(dot(viewDirection, H), 0.000001);
  float x = 2.0 * NdotH / VdotH;
  float G = min(1.0, min(x * VdotN, x * LdotN));

  //Distribution term
  float D = beckmannDistribution(NdotH, roughness);

  //Fresnel term
  float F = pow(1.0 - VdotN, fresnel);

  //Multiply terms
  float power =  G * F * D / max(3.14159265 * VdotN * LdotN, 0.000001);

  return lightColor * LdotN * (k + power * (1.0 - k));
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
    vec4 accum = vec4(0.0);

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

    vec3 lightPos[3];
    lightPos[0] = vec3(1, 1, 1);
    lightPos[1] = vec3(-1, -1, -1);
    lightPos[2] = vec3(1, 1, -1);

    //Perform the ray marching iterations
    for(int i = 0; i < uSteps; i++) {

        if(currentPosition.x > 1.0 || currentPosition.y > 1.0 || currentPosition.z > 1.0 || currentPosition.x < 0.0 || currentPosition.y < 0.0 || currentPosition.z < 0.0)
            break;
        if(accumulatedColor.a >= 1.0) {
          vec3 V = normalize(pos - currentPosition);
          vec3 N = normalize(getNormal(currentPosition));

          // set important material values for cookTorranceSpecular
          float roughnessValue = 0.6; // 0 : smooth, 1: rough
          float F0 = 5.0; // fresnel reflectance at normal incidence
          float k = 0.7; // fraction of diffuse reflection (specular reflection = 1 - k)

          for(int i = 0; i < 3; ++i) {
            vec3 L = normalize(lightPos[i] - currentPosition);
            if (uSetViewMode == 0) { // Blinn-Phong shading mode
                vec3 Iamb = ambientLighting(accumulatedColor.rgb);
                vec3 Idif = diffuseLighting(N, L, accumulatedColor.rgb);
                vec3 Ispe = specularLighting(N, L, V, accumulatedColor.rgb);

                sample.rgb += (Iamb + Idif + Ispe);
            }
            else if(uSetViewMode == 1) { // Cook-Torrance mode
              sample.rgb += cookTorranceSpecular(N, L, V, roughnessValue, F0, k, accumulatedColor.rgb);
            }
          }

          accum = sample;
          break;
        }

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
            // sample.a = colorSample.a;
            sample.a = 1.0 - pow(1.0 - colorSample.a, 256.0f / uSteps);
            sample.rgb = (1.0 - accumulatedColor.a) * hsv2rgb(colorSample.xyz) * sample.a;
            // accumulatedColor.a += (1.0 - accumulatedColor.a) * colorSample.a * uOpacityVal;
            accumulatedColor += sample;

        }

        //Advance the ray.
        //currentPosition.xyz += deltaDirection;
        currentPosition.xyz += Step;


    }
    gl_FragColor = accum;
}
