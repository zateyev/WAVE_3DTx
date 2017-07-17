precision mediump int;
precision mediump float;
varying vec4 frontColor;
varying vec4 pos;
uniform sampler2D uBackCoord;
uniform sampler3D uSliceMaps;
uniform vec3 uLightPos;
uniform int uSetViewMode;
uniform float uMinGrayVal;
uniform float uMaxGrayVal;
uniform float uSteps;
uniform float l;
uniform float s;

float xw = 256.0;
float yw = 256.0;
float zw = 252.0;

// float xw = 419.0;
// float yw = 492.0;
// float zw = 462.0;

// Compute the Normal around the current voxel
vec3 getNormal(vec3 at)
{
    vec3 texpos1;

    float w0 = (at.z - (1.0/zw)) - floor(at.z);
    float w1 = at.z - floor(at.z);
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
const vec3 lightColor = vec3(1.0, 0.88, 0.74);
const vec3 u_intensity = vec3(0.1, 0.1, 0.1);
vec3 ambientLighting()
{
    const vec3 u_matAmbientReflectance = lightColor;
    // const vec3 u_lightAmbientIntensity = vec3(0.6, 0.3, 0.0);
    const vec3 u_lightAmbientIntensity = u_intensity;

    return u_matAmbientReflectance * u_lightAmbientIntensity;
}
// returns intensity of diffuse reflection
vec3 diffuseLighting(in vec3 N, in vec3 L)
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
vec3 specularLighting(in vec3 N, in vec3 L, in vec3 V)
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
  float k) {

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

void bubbleSort(float arr[]){
  bool swapped = true;
  int n = 27;
  float tmp;
  while (swapped) {
    swapped = false;
    for (int i = 0; i < n - 1; ++i) {
      if (arr[i] > arr[i + 1]) {
        tmp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = tmp;
        swapped = true;
        }
    }
    n--;
  }
}

void main(void)
{
    vec2 texC = ((pos.xy/pos.w) + 1.0) / 2.0;
    vec4 backColor = texture2D(uBackCoord, texC);
    vec3 dir = backColor.rgb - frontColor.rgb;
    vec4 currentPosition = frontColor;
    vec3 Step = dir/uSteps;
    vec4 accum = vec4(0, 0, 0, 0);
    vec4 sample = vec4(0.0, 0.0, 0.0, 1.0);
    vec3 lightPos[3];
    lightPos[0] = vec3(1, 1, 1);
    lightPos[1] = vec3(-1, -1, -1);
    // lightPos[2] = vec3(-1, -1, 1);
    lightPos[2] = vec3(1, 1, -1);

    float cylinderRadius = 0.4;
    float xsqu;
    float ysqu;
    float distanceFromCenter;

    for(int i = 0; i < uSteps; i++) {

      xsqu = (0.5 - currentPosition.x) * (0.5 - currentPosition.x);
      ysqu = (0.5 - currentPosition.y) * (0.5 - currentPosition.y);
      distanceFromCenter = sqrt(xsqu + ysqu);

      if (distanceFromCenter < cylinderRadius && currentPosition.z > 0.1 && currentPosition.z < 0.9) {
        /* code */
        float gray_val = texture(uSliceMaps, currentPosition.xyz);

        if (uSetViewMode == 0 && gray_val > uMinGrayVal && gray_val < uMaxGrayVal) {
          int mask_size = 5;
          // const int voxels_number = pow(mask_size, 3);
          float gray_values[27];
          int neighbour_i = 0;
          vec3 offset;
          vec3 curDotPos;
          for(int i = 0; i < mask_size; ++i) {
            for(int j = 0; j < mask_size; ++j) {
              for(int k = 0; k < mask_size; ++k) {
                offset = vec3((i - (int)mask_size / 2) / xw,
                (j - (int)mask_size / 2) / yw,
                (k - (int)mask_size / 2) / zw);

                curDotPos = currentPosition.xyz + offset;
                gray_values[neighbour_i] = texture(uSliceMaps, curDotPos).x;
                neighbour_i++;
              }
            }
          }

          // bubbleSort(gray_values);
          bool swapped = true;
          int n = 27;
          float tmp;
          while (swapped) {
            swapped = false;
            for (int i = 0; i < n - 1; ++i) {
              if (gray_values[i] > gray_values[i + 1]) {
                tmp = gray_values[i];
                gray_values[i] = gray_values[i + 1];
                gray_values[i + 1] = tmp;
                swapped = true;
              }
            }
            n--;
          }

          gray_val = gray_values[13];

        }
        if(gray_val > uMinGrayVal && gray_val < uMaxGrayVal) {
          // normalize vectors after interpolation
          vec3 V = normalize(pos - currentPosition.xyz);
          vec3 N = normalize(getNormal(currentPosition.xyz));

          // set important material values for cookTorranceSpecular
          float roughnessValue = 0.6; // 0 : smooth, 1: rough
          float F0 = 5.0; // fresnel reflectance at normal incidence
          float k = 0.7; // fraction of diffuse reflection (specular reflection = 1 - k)

          for(int light_i = 0; light_i < 3; ++light_i) {
            vec3 L = normalize(lightPos[light_i] - currentPosition.xyz);
            if (uSetViewMode == 0) { // Blinn-Phong shading mode
              vec3 Iamb = ambientLighting();
              vec3 Idif = diffuseLighting(N, L);
              vec3 Ispe = specularLighting(N, L, V);
              sample.rgb += (Iamb + Idif + Ispe);

            }
            else if(uSetViewMode == 1) { // Cook-Torrance mode
              vec3 Iamb = ambientLighting();
              vec3 Idif = diffuseLighting(N, L);
              vec3 Ispe = specularLighting(N, L, V);
              sample.rgb += (Iamb + Idif + Ispe);
            }
          }

          accum += sample;
          if(accum.a >= 1.0)
          break;
        }
      }


      //advance the current position
      currentPosition.xyz += Step;

      if(currentPosition.x > 1.0 || currentPosition.y > 1.0 || currentPosition.z > 1.0 || currentPosition.x < 0.0 || currentPosition.y < 0.0 || currentPosition.z < 0.0)
          break;
    }
    gl_FragColor = accum;

    // for test
    // gl_FragColor = vec4(frontColor.rgb, 1.0);
    // gl_FragColor = backColor;
}
