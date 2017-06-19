precision mediump int;
precision mediump float;
varying vec4 frontColor;
varying vec4 pos;
varying vec3 worldPosition;
uniform sampler2D uBackCoord;
uniform sampler3D uSliceMaps;
uniform float uNumberOfSlices;
uniform float uOpacityVal;
uniform float uSlicesOverX;
uniform float uSlicesOverY;
uniform float darkness;
uniform vec3 uLightPos;
uniform int uSetViewMode;
uniform float uMinGrayVal;
uniform float uMaxGrayVal;
uniform float uSteps;
uniform float l;
uniform float s;
uniform float hMin;
uniform float hMax;

// Compute the Normal around the current voxel
vec3 getNormal(vec3 at)
{
    float xw = 419.0;
    float yw = 492.0;
    float zw = 462.0;

    // float xw = 256.0;
    // float yw = 256.0;
    // float zw = 252.0;

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
vec3 ambientLighting()
{
    const vec3 u_matAmbientReflectance = vec3(1.0, 1.0, 1.0);
    // const vec3 u_lightAmbientIntensity = vec3(0.6, 0.3, 0.0);
    const vec3 u_lightAmbientIntensity = vec3(0.5, 0.5, 0.5);

    return u_matAmbientReflectance * u_lightAmbientIntensity;
}
// returns intensity of diffuse reflection
vec3 diffuseLighting(in vec3 N, in vec3 L)
{
    const vec3 u_matDiffuseReflectance = vec3(1, 1, 1);
    // const vec3 u_lightDiffuseIntensity = vec3(1.0, 0.5, 0);
    const vec3 u_lightDiffuseIntensity = vec3(0.5, 0.5, 0.5);

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
    const vec3 u_lightSpecularIntensity = vec3(0.5, 0.5, 0.5);
    const vec3 u_matSpecularReflectance = vec3(1, 1, 1);
    const float u_matShininess = 5.0;
   // calculate specular reflection only if
   // the surface is oriented to the light source
   if(dot(N, L) > 0.0)
   {
      // half vector
      vec3 H = normalize(L + V);
      specularTerm = pow(dot(N, H), u_matShininess);
   }
   return u_matSpecularReflectance * u_lightSpecularIntensity * specularTerm;
}
void main(void)
{
    vec2 texC = ((pos.xy/pos.w) + 1.0) / 2.0;
    vec4 backColor = texture2D(uBackCoord, texC);
    vec3 dir = backColor.rgb - frontColor.rgb;
    vec4 vpos = frontColor;
    vec3 Step = dir/uSteps;
    vec4 accum = vec4(0, 0, 0, 0);
    vec4 sample = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 colorValue = vec4(0, 0, 0, 0);
    vec3 lightPos = vec3(1, 1, 1);

    for(int i = 0; i < uSteps; i++) {
        float gray_val = texture(uSliceMaps, vpos.xyz);
        // float gray_val = (texture(uSliceMaps, vpos.xyz).x - uMinGrayVal) / (uMaxGrayVal - uMinGrayVal);
        if(gray_val < uMinGrayVal || gray_val > uMaxGrayVal)
            colorValue = vec4(0.0);
        else {
            colorValue.x = (-1.0 * 2.0 - gray_val) * l * 0.4;
            //colorValue.x = gray_val;
            colorValue.w = 0.1;
            if ( 1 == 1 ) {
                // normalize vectors after interpolation
                vec3 L = normalize(vpos.xyz - lightPos);
                vec3 V = normalize( pos - vpos.xyz );
                vec3 N = normalize(getNormal(vpos.xyz));
                // get Blinn-Phong reflectance components
                vec3 Iamb = ambientLighting();
                vec3 Idif = diffuseLighting(N, L);
                vec3 Ispe = specularLighting(N, L, V);

                // vec3 Iamb = gl_FrontLightProduct[0].ambient;
                // vec3 Idif = gl_FrontLightProduct[0].diffuse * max(dot(N, L), 0.0);
                // Idif = clamp(Idif, 0.0, 1.0);
                // vec3 e = normalize(-V);
                // vec3 r = normalize(-reflect(L, N));
                // vec3 Ispe = gl_FrontLightProduct[0].specular * pow(max(dot(r, e), 0.0), gl_FrontMaterial.shininess);
                // Ispe = clamp(Ispe, 0.0, 1.0);

                // diffuse color of the object from texture
                //vec3 diffuseColor = texture(u_diffuseTexture, o_texcoords).rgb;

                vec3 mycolor = (Iamb + Idif + Ispe);
                //vec3 mycolor = colorValue.xxx * (Iamb + Ispe);
                sample.rgb = mycolor;
                sample.a = 1.0;
            } else {
                sample.rgb = (1.0 - accum.a) * colorValue.xxx * sample.a;
                sample.a = colorValue.a * uOpacityVal * (1.0 / uSteps);
            }
            accum += sample;
            if(accum.a>=1.0)
               break;
        }

        //advance the current position
        vpos.xyz += Step;

        if(vpos.x > 1.0 || vpos.y > 1.0 || vpos.z > 1.0 || vpos.x < 0.0 || vpos.y < 0.0 || vpos.z < 0.0)
            break;
    }
    gl_FragColor = accum;

    // for test
    // gl_FragColor = vec4(frontColor.rgb, 1.0);
    // gl_FragColor = backColor;
}
