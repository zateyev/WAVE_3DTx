#ifndef DWAVE_H
#define DWAVE_H

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

#include "texture.hpp"
#include "shader.hpp"

#include <include/GL/glui.h>

#include <iomanip> // setprecision
#include <sstream>

#include <png.h>

using namespace std;
using glm::mat4;
using glm::vec3;

namespace dwave {

  class Dwave {
    private:
      static const int SCREENSHOT_MAX_FILENAME = 5;
      static GLubyte *pixels;
      static GLuint fbo;
      static GLuint rbo_color;
      static GLuint rbo_depth;
      static const unsigned int HEIGHT = 800;
      static const unsigned int WIDTH = 800;
      static int offscreen;
      static unsigned int max_nframes;
      static unsigned int nframes;
      static unsigned int time0;

      /* Model. */
      static double angle;
      static double delta_angle;

      static png_byte *png_bytes;
      static png_byte **png_rows;

      GLuint g_vao;
      Shader shader;
      GLuint g_winWidth;//900;
      GLuint g_winHeight;//800;
      GLint g_angle;
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

      float g_NumberOfSlices;
      int png_width;
      int png_height;
      int maxTexturesNumber;
      float g_SlicesOverX;
      float g_SlicesOverY;
      string datasetDir;
      int uSetViewMode;

      float g_stepSize;
      float g_MinGrayVal;
      float g_MaxGrayVal;
      float g_OpacityVal;
      float g_ColorVal;
      float g_AbsorptionModeIndex;
      float cyl_rad;


      int tr_width;
      int tr_height;

      int last_x, last_y;
      float rotationX;
      float rotationY;
      float initialFoV;
      float FoV;

      int xx;
      int yy;
      int ww;
      int hh;

      float angleX;
      float angleY;

      int main_window;

      /** Pointers to the windows and some of the controls we'll create **/
      GLUI *glui, *glui2;
      GLUI_Spinner *light0_spinner, *light1_spinner;
      GLUI_RadioGroup *radio;
      GLUI_Panel *obj_panel;
      GLUI_StaticText *fps_val;
      GLUI_StaticText *min_gr_label;
      GLUI_Spinner *spinner;

      static void screenshot_png(const char *filename, unsigned int width, unsigned int height,
        GLubyte **pixels, png_byte **png_bytes, png_byte ***png_rows);

      static int model_finished(void);

      double getTickCount(void);

      void init();

      void render(GLenum cullFace);

      void initVBO();

      void drawBox(GLenum glFaces);

      GLuint initFace2DTex(GLuint bfTexWidth, GLuint bfTexHeight);

      void checkFramebufferStatus();

      void initFrameBuffer(GLuint texObj, GLuint texWidth, GLuint texHeight);

      void rcSetUinforms();

      void initShader();

      void updateCamera();

    protected:
      static Dwave* instance;

    public:
      Dwave();
      virtual ~Dwave();

      void startDwave(int argc, char** argv);

      void calculateFrameRate();

      void timerCB(int millisec);

      void reshape(int w, int h);

      void keyboard(unsigned char key, int x, int y);

      void motion(int x, int y );

      void mouseMove(int button, int button_state, int x, int y );

      void rotateDisplay();

      void display();

      void setInstance();

      static void displayWrapper();
      static void timerCBWrapper(int millisec);
      static void reshapeWrapper(int width, int height);
      static void keyboardWrapper(unsigned char key, int x, int y);
      static void motionWrapper(int x, int y );
      static void mouseMoveWrapper(int button, int button_state, int x, int y );
      static void rotateDisplayWrapper();
  };
} // namespace dwave

#endif
