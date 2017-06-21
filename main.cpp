#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <GL/glew.h>
#include <include/GL/glext.h>
#include <include/GL/glut.h>
#include <include/GL/glm/glm.hpp>
#include <include/GL/glm/gtc/matrix_transform.hpp>
#include <include/GL/glm/gtx/transform2.hpp>
#include <include/GL/glm/gtc/type_ptr.hpp>

#include <common/texture.hpp>
#include <common/shader.hpp>

#include <include/GL/glui.h>

#include <iomanip> // setprecision
#include <sstream>


#define GL_ERROR() checkForOpenGLError(__FILE__, __LINE__)
using namespace std;
using glm::mat4;
using glm::vec3;

GLuint g_vao;
Shader shader;
GLuint g_winWidth = 900;
GLuint g_winHeight = 800;
GLint g_angle = 0;
GLuint g_frameBuffer;
// transfer function
GLuint g_bfTexObj;
GLuint g_texWidth;
GLuint g_texHeight;
GLuint g_rcVertHandle;
GLuint g_rcFragHandle;
GLuint g_bfVertHandle;
GLuint g_bfFragHandle;
// GLuint *pngTex;
GLuint pngTex;
GLuint trTex;

float g_NumberOfSlices = 512.0;
int png_width = 4096;
int png_height = png_width;
int maxTexturesNumber = 8;
float g_SlicesOverX = 8.0;
float g_SlicesOverY = g_SlicesOverX;
string datasetDir = "../sprites/";
int uSetViewMode = 0;

// float g_NumberOfSlices = 1024.0;
// int png_width = 16384;
// int png_height = png_width;
// int maxTexturesNumber = 4;
// float g_SlicesOverX = 16.0;
// float g_SlicesOverY = g_SlicesOverX;
// string datasetDir = "../sprites_1024/";

// float g_NumberOfSlices = 2016.0;
// int png_width = 18144;
// int png_height = png_width;
// int maxTexturesNumber = 2;
// float g_SlicesOverX = 9.0;
// float g_SlicesOverY = g_SlicesOverX;
// string datasetDir = "../sprites_2016/";

// float g_NumberOfSlices = 384.0; // 1920
// int png_width = 16128;
// int png_height = png_width;
// int maxTexturesNumber = 6; // > 7
// float g_SlicesOverX = 8.0;
// float g_SlicesOverY = g_SlicesOverX;
// string datasetDir = "../slicemaps/";

float g_stepSize = 200.0;
float g_MinGrayVal = 0.278; // 0
float g_MaxGrayVal = 1.0; // 1
float g_OpacityVal = 1.0; // 40
float g_ColorVal = 1.0; // 0.4
float g_AbsorptionModeIndex = 1.0; // -1.0 ? 1

// bool loadPngImage(const char *name, int &outWidth, int &outHeight, GLubyte **outData);

int tr_width = 256;
int tr_height = 10;

int   last_x, last_y;
float rotationX = 0.0, rotationY = 0.0;
float initialFoV = 45.0f;
float FoV = 45.0f;

int main_window;

/** Pointers to the windows and some of the controls we'll create **/
GLUI *glui, *glui2;
GLUI_Spinner    *light0_spinner, *light1_spinner;
GLUI_RadioGroup *radio;
GLUI_Panel      *obj_panel;
GLUI_StaticText *fps_val;
GLUI_Spinner *spinner;

int checkForOpenGLError(const char* file, int line)
{
    // return 1 if an OpenGL error occured, 0 otherwise.
    GLenum glErr;
    int retCode = 0;

    glErr = glGetError();
    while(glErr != GL_NO_ERROR)
    {
    	cout << "glError in file " << file
    	     << "@line " << line << gluErrorString(glErr) << endl;
    	retCode = 1;
    	exit(EXIT_FAILURE);
    }
    return retCode;
}
void keyboard(unsigned char key, int x, int y);
void display(void);
void initVBO();
void initShader();
void initFrameBuffer(GLuint, GLuint, GLuint);
GLuint initFace2DTex(GLuint texWidth, GLuint texHeight);

double GetTickCount(void)
{
  struct timespec now;
  if (clock_gettime(CLOCK_MONOTONIC, &now))
    return 0;
  return now.tv_sec * 1000.0 + now.tv_nsec / 1000000.0;
}

void CalculateFrameRate()
{
  static float framesPerSecond    = 0.0f;       // This will store our fps
  static float lastTime   = 0.0f;       // This will hold the time from the last frame
  float currentTime = GetTickCount() * 0.001f;
  //printf("%.1f FPS\n", currentTime);
  ++framesPerSecond;
  if( currentTime - lastTime >= 1.0f )
  {
    stringstream stream;
    stream << fixed << setprecision(2) << framesPerSecond
      << "\nLatency: " << 1000.0/double(framesPerSecond);
    string str = "FPS: " + stream.str();

    char *cstr = new char[str.length() + 1];
    strcpy(cstr, str.c_str());
    fps_val->set_text(cstr);
    delete [] cstr;

    // lastTime++;
    lastTime = currentTime;
    // if(SHOW_FPS == 1) fprintf(stderr, "\nCurrent Frames Per Second: %d\n\n", (int)framesPerSecond);
    framesPerSecond = 0;
  }
}

void render(GLenum cullFace);

void init()
{
  g_texWidth = g_winWidth;
  g_texHeight = g_winHeight;
  initVBO();
  initShader();

  // pngTex = new GLuint[maxTexturesNumber];

  // texture.loadImage(datasetDir, pngTex, &png_width, &png_height, maxTexturesNumber);
  Texture texture;
  texture.initVol3DTex("../final.screw_joint.raw", &pngTex, 419, 492, 462);
  // texture.initVol3DTex("../256.raw", &pngTex, 256, 256, 252);

  // texture.initVol3DTex("../final.screw_joint.raw", &pngTex, 419, 492, 462);

  // texture.loadImage2("../cm_BrBG_r.png", &trTex, &tr_width, &tr_height, 1); // cm_Greys_r
  texture.initTFF1DTex("../tff.dat", &trTex);

  // texture.loadImage2("../cm_BrBG_r.png", &trTex, &tr_width, &tr_height);

  g_bfTexObj = initFace2DTex(g_texWidth, g_texHeight);
  GL_ERROR();

  initFrameBuffer(g_bfTexObj, g_texWidth, g_texHeight);
  GL_ERROR();
  glutPostRedisplay();
}
// init the vertex buffer object
void initVBO()
{
    GLfloat vertices[24] = {
    	0.0, 0.0, 0.0,
    	0.0, 0.0, 1.0,
    	0.0, 1.0, 0.0,
    	0.0, 1.0, 1.0,
    	1.0, 0.0, 0.0,
    	1.0, 0.0, 1.0,
    	1.0, 1.0, 0.0,
    	1.0, 1.0, 1.0
    };

    GLuint indices[36] = {
    	1,5,7,
    	7,3,1,
    	0,2,6,
      6,4,0,
    	0,1,3,
    	3,2,0,
    	7,5,4,
    	4,6,7,
    	2,3,7,
    	7,6,2,
    	1,0,4,
    	4,5,1
    };
    GLuint gbo[2];

    glGenBuffers(2, gbo);
    GLuint vertexdat = gbo[0];
    GLuint veridxdat = gbo[1];
    glBindBuffer(GL_ARRAY_BUFFER, vertexdat);
    glBufferData(GL_ARRAY_BUFFER, 24*sizeof(GLfloat), vertices, GL_STATIC_DRAW);
    // used in glDrawElement()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, veridxdat);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, 36*sizeof(GLuint), indices, GL_STATIC_DRAW);

    GLuint vao;
    glGenVertexArrays(1, &vao);
    // vao like a closure binding 3 buffer object: verlocdat vercoldat and veridxdat
    glBindVertexArray(vao);
    glEnableVertexAttribArray(0); // for vertexloc
    glEnableVertexAttribArray(1); // for vertexcol

    // the vertex location is the same as the vertex color
    glBindBuffer(GL_ARRAY_BUFFER, vertexdat);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, (GLfloat *)NULL);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, (GLfloat *)NULL);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, veridxdat);
    // glBindVertexArray(0);
    g_vao = vao;
}

void drawBox(GLenum glFaces)
{
    glEnable(GL_CULL_FACE);
    glCullFace(glFaces);
    glBindVertexArray(g_vao);
    glDrawElements(GL_TRIANGLES, 36, GL_UNSIGNED_INT, (GLuint *)NULL);
    glDisable(GL_CULL_FACE);
}

GLuint initFace2DTex(GLuint bfTexWidth, GLuint bfTexHeight)
{
    GLuint backFace2DTex;
    glGenTextures(1, &backFace2DTex);
    glBindTexture(GL_TEXTURE_2D, backFace2DTex);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, bfTexWidth, bfTexHeight, 0, GL_RGBA, GL_FLOAT, NULL);
    return backFace2DTex;
}

void checkFramebufferStatus()
{
    GLenum complete = glCheckFramebufferStatus(GL_FRAMEBUFFER);
    if (complete != GL_FRAMEBUFFER_COMPLETE)
    {
    	cout << "framebuffer is not complete" << endl;
    	exit(EXIT_FAILURE);
    }
}

// init the framebuffer, the only framebuffer used in this program
void initFrameBuffer(GLuint texObj, GLuint texWidth, GLuint texHeight)
{
    // create a depth buffer for our framebuffer
    GLuint depthBuffer;
    glGenRenderbuffers(1, &depthBuffer);
    glBindRenderbuffer(GL_RENDERBUFFER, depthBuffer);
    glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT, texWidth, texHeight);

    // attach the texture and the depth buffer to the framebuffer
    glGenFramebuffers(1, &g_frameBuffer);
    glBindFramebuffer(GL_FRAMEBUFFER, g_frameBuffer);
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texObj, 0);
    glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, depthBuffer);
    checkFramebufferStatus();
    glEnable(GL_DEPTH_TEST);
}

void rcSetUinforms()
{
  shader.setUniform("uSteps", g_stepSize);
  shader.setUniform("uTransferFunction", GL_TEXTURE_1D, trTex, 0);
  shader.setUniform("uBackCoord", GL_TEXTURE_2D, g_bfTexObj, 1);

  // string sprites;
  // GLint volumeLoc;
  // for (int i = 0; i < maxTexturesNumber; i++)
  // {
  //   sprites = "uSliceMaps[" + to_string(i) + "]";
  //   volumeLoc = glGetUniformLocation(shader.get_programHandle(), sprites.c_str());
  //   if (volumeLoc >= 0)
  //   {
  //   	glActiveTexture(GL_TEXTURE2 + i); // GL_TEXTURE2
  //   	glBindTexture(GL_TEXTURE_2D, *pngTex + i);
  //   	glUniform1i(volumeLoc, 2 + i);
  //   }
  //   else cout << "uSliceMaps is not bind to the uniform\n";
  // }

  shader.setUniform("uSliceMaps", GL_TEXTURE_3D, pngTex, 2);
  shader.setUniform("uMinGrayVal", g_MinGrayVal);
  shader.setUniform("uMaxGrayVal", g_MaxGrayVal);
  shader.setUniform("uOpacityVal", g_OpacityVal);
  shader.setUniform("uSetViewMode", uSetViewMode);

  // shader.setUniform("uNumberOfSlices", g_NumberOfSlices);
  // shader.setUniform("uColorVal", g_ColorVal);
  // shader.setUniform("uAbsorptionModeIndex", g_AbsorptionModeIndex);
  // shader.setUniform("uSlicesOverX", g_SlicesOverX);
  // shader.setUniform("uSlicesOverY", g_SlicesOverY);

  GL_ERROR();
}

// init the shader object and shader program
void initShader()
{
// vertex shader object for first pass
    g_bfVertHandle = Shader::initShaderObj("../shader/firstPass.vert", GL_VERTEX_SHADER);
// fragment shader object for first pass
    g_bfFragHandle = Shader::initShaderObj("../shader/firstPass.frag", GL_FRAGMENT_SHADER);
// vertex shader object for second pass
    g_rcVertHandle = Shader::initShaderObj("../shader/secondPass.vert", GL_VERTEX_SHADER);
// fragment shader object for second pass
    g_rcFragHandle = Shader::initShaderObj("../shader/secondPassSoebel.frag", GL_FRAGMENT_SHADER);
// create the shader program , use it in an appropriate time
    shader.createShaderPgm();
}

void display()
{
    int tx, ty, tw, th;
    GLUI_Master.get_viewport_area( &tx, &ty, &tw, &th );

    glEnable(GL_DEPTH_TEST);
    GL_ERROR();
    // render to texture
    glBindFramebuffer(GL_DRAW_FRAMEBUFFER, g_frameBuffer);
    glViewport(0, 0, g_winWidth, g_winHeight);
    Shader::linkShader(shader.get_programHandle(), g_bfVertHandle, g_bfFragHandle);
    glUseProgram(shader.get_programHandle());
    // cull front face
    render(GL_FRONT);
    glUseProgram(0);
    GL_ERROR();
    glBindFramebuffer(GL_FRAMEBUFFER, 0);

    tx = (g_winWidth - tw) / 2;
    glViewport(-tx, 0, g_winWidth, g_winHeight);

    Shader::linkShader(shader.get_programHandle(), g_rcVertHandle, g_rcFragHandle);
    GL_ERROR();
    glUseProgram(shader.get_programHandle());
    rcSetUinforms();
    GL_ERROR();
    render(GL_BACK);
    glUseProgram(0);
    GL_ERROR();

    glutSwapBuffers();
}

float angleX=0;
float angleY=0;

void render(GLenum cullFace)
{
    GL_ERROR();
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    //  transform the box
    glm::mat4 projection = glm::perspective(FoV, (GLfloat)g_winWidth/g_winHeight, 0.1f, 400.f);
    // glm::mat4 view = glm::lookAt(glm::vec3(1.0f, 1.0f, 2.0f),
    // 				 glm::vec3(0.0f, 0.0f, 0.0f),
    // 				 glm::vec3(0.0f, 1.0f, 0.0f));

    glm::mat4 view = glm::lookAt(glm::vec3(0.0f, 0.0f, 3.0f),
    				 glm::vec3(0.0f, 0.0f, 0.0f),
    				 glm::vec3(0.0f, 1.0f, 0.0f));

    glm::mat4 model = mat4(1.0f);
    //model *= glm::rotate((float)g_angle, glm::vec3(0.0f, 1.0f, 0.0f));
    // to make the "head256.raw" i.e. the volume data stand up.
    //model *= glm::rotate(180.0f, vec3(1.0f, 0.0f, 0.0f));
    model *= glm::rotate(angleX, vec3(0.0f, 1.0f, 0.0f));
    model *= glm::rotate((180.0f+angleY), vec3(1.0f, 0.0f, 0.0f));

    model *= glm::translate(glm::vec3(-0.5f, -0.5f, -0.5f));
    // notice the multiplication order: reverse order of transform
    glm::mat4 mvp = projection * view * model;
    GLuint mvpIdx = glGetUniformLocation(shader.get_programHandle(), "MVP");
    if (mvpIdx >= 0)
    {
    	glUniformMatrix4fv(mvpIdx, 1, GL_FALSE, &mvp[0][0]);
    }
    else
    {
    	cerr << "can't get the MVP" << endl;
    }
    GL_ERROR();
    drawBox(cullFace);
    GL_ERROR();
}

void myGlutMouse(int button, int button_state, int x, int y )
{
  if ( button == GLUT_LEFT_BUTTON && button_state == GLUT_DOWN )
  {
    last_x = x;
    last_y = y;
  }

  if (button == 3)
  {
    if (FoV > 1) FoV-=1;
  }

  if (button == 4)
  {
    if (FoV < 179) FoV+=1;
  }
  glutPostRedisplay();
}

void myGlutMotion(int x, int y )
{
  rotationX += (float) (y - last_y);
  rotationY += (float) (x - last_x);

  angleY= 180 * rotationX/g_winWidth;
  angleX= 180 * rotationY/g_winHeight;

  last_x = x;
  last_y = y;

  glutPostRedisplay();
}


void rotateDisplay()
{
    g_angle = (g_angle + 1) % 360;
    glutPostRedisplay();
}
void reshape(int w, int h)
{
    g_winWidth = w;
    g_winHeight = h;
    g_texWidth = w;
    g_texHeight = h;
}

void keyboard(unsigned char key, int x, int y)
{
    switch (key)
    {
    case '\x1B':
	exit(EXIT_SUCCESS);
	break;
    }
}

void timerCB(int millisec)
{
  CalculateFrameRate();

glutTimerFunc(millisec, timerCB, millisec);
glutPostRedisplay();
}

int main(int argc, char** argv)
{
  glutInit(&argc, argv);
  glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGBA | GLUT_DEPTH);
  glutInitWindowPosition( 50, 50 );
  glutInitWindowSize(900, 800);

  main_window = glutCreateWindow("OpenGL VRC");
  GLenum err = glewInit();
  if (GLEW_OK != err)
  {
  	/* Problem: glewInit failed, something is seriously wrong. */
  	fprintf(stderr, "Error: %s\n", glewGetErrorString(err));
  }

  glutDisplayFunc(&display);
  glutTimerFunc(10, timerCB, 10);
  glutReshapeFunc(&reshape);
  glutKeyboardFunc(&keyboard);
  glutMotionFunc(&myGlutMotion);
  glutMouseFunc(&myGlutMouse);
  //glutIdleFunc(&rotateDisplay);
  // init();

  /****************************************/
  /*         Here's the GLUI code         */
  /****************************************/

  printf( "GLUI version: %3.2f\n", GLUI_Master.get_version() );

  /*** Create the side subwindow ***/
  glui = GLUI_Master.create_glui_subwindow(main_window, GLUI_SUBWINDOW_RIGHT);

  // obj_panel = new GLUI_Rollout(glui, "Properties", false);
  obj_panel = new GLUI_Panel(glui, "");

  /***** Control for object params *****/

  GLUI_Scrollbar *sb;
  GLUI_Separator *separator;

  fps_val = new GLUI_StaticText(obj_panel, "120 FPS");

  separator = new GLUI_Separator(obj_panel);

  GLUI_StaticText *op_label = new GLUI_StaticText(obj_panel, "Opacity:");
  sb = new GLUI_Scrollbar(obj_panel, "Opacity", GLUI_SCROLL_HORIZONTAL, &g_OpacityVal);
  sb->set_float_limits(0, 40);

  separator = new GLUI_Separator(obj_panel);

  GLUI_StaticText *min_gr_label = new GLUI_StaticText(obj_panel, "MinGrayVal:");
  sb = new GLUI_Scrollbar(obj_panel, "MinGrayVal", GLUI_SCROLL_HORIZONTAL, &g_MinGrayVal);
  sb->set_float_limits(0, 1);

  separator = new GLUI_Separator(obj_panel);

  GLUI_StaticText *max_gr_label = new GLUI_StaticText(obj_panel, "MaxGrayVal:");
  sb = new GLUI_Scrollbar(obj_panel, "MaxGrayVal", GLUI_SCROLL_HORIZONTAL, &g_MaxGrayVal);
  sb->set_float_limits(0, 1);

  separator = new GLUI_Separator(obj_panel);

  GLUI_StaticText *color_val_label = new GLUI_StaticText(obj_panel, "ColorVal:");
  sb = new GLUI_Scrollbar(obj_panel, "ColorVal", GLUI_SCROLL_HORIZONTAL, &g_ColorVal);
  sb->set_float_limits(0, 1.0);

  separator = new GLUI_Separator(obj_panel);

  // GLUI_StaticText *step_size_label = new GLUI_StaticText(obj_panel, "StepSize:");
  // GLUI_Spinner *spinner = new GLUI_Spinner(obj_panel, "StepSize:", &g_stepSize);
  spinner = new GLUI_Spinner(obj_panel, "StepSize:", &g_stepSize);
  spinner->set_float_limits(0, 1024.0);
  spinner->set_alignment(GLUI_ALIGN_RIGHT);
  sb = new GLUI_Scrollbar(obj_panel, "StepSize", GLUI_SCROLL_HORIZONTAL, &g_stepSize);
  sb->set_float_limits(0, 1024.0);

  /**** Add listbox ****/
  new GLUI_StaticText( glui, "" );
  GLUI_Listbox *list = new GLUI_Listbox( glui, "View mode:", &uSetViewMode );
  list->add_item(0, "Blinn-Phong shading");
  list->add_item(1, "Cook-Torrance");

  init();

  glui->set_main_gfx_window(main_window);

  glutMainLoop();
  return EXIT_SUCCESS;
}
