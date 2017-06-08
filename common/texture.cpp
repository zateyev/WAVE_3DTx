#include <fstream>
#include <iostream>
#include <cstring>
#include <GL/glew.h>
#include <include/GL/gl.h>
#include <png.h>
#include "texture.hpp"

using namespace std;


void Texture::initVol3DTex(const char* filename, GLuint* texture, GLuint w, GLuint h, GLuint d)
{

    FILE *fp;
    size_t size = w * h * d;
    GLubyte *data = new GLubyte[size];			  // 8bit
    if (!(fp = fopen(filename, "rb")))
    {
        cout << "Error: opening .raw file failed" << endl;
        exit(EXIT_FAILURE);
    }
    else
    {
        cout << "OK: open .raw file successed" << endl;
    }
    if ( fread(data, sizeof(char), size, fp)!= size)
    {
        cout << "Error: read .raw file failed" << endl;
        exit(1);
    }
    else
    {
        cout << "OK: read .raw file successed" << endl;
    }
    fclose(fp);

    glGenTextures(1, texture);
    // bind 3D texture target
    glBindTexture(GL_TEXTURE_3D, *texture);
    glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_WRAP_S, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_WRAP_T, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_WRAP_R, GL_REPEAT);
    // pixel transfer happens here from client to OpenGL server
    glPixelStorei(GL_UNPACK_ALIGNMENT,1);
    glTexImage3D(GL_TEXTURE_3D, 0, GL_INTENSITY, w, h, d, 0, GL_LUMINANCE, GL_UNSIGNED_BYTE,data);

    delete []data;
    cout << "volume texture created" << endl;
}

void Texture::initTFF1DTex(const char* filename, GLuint* texture)
{
    // read in the user defined data of transfer function
    ifstream inFile(filename, ifstream::in);
        if (!inFile)
    {
	cerr << "Error openning file: " << filename << endl;
	exit(EXIT_FAILURE);
    }

    const int MAX_CNT = 10000;
    GLubyte *tff = (GLubyte *) calloc(MAX_CNT, sizeof(GLubyte));
    inFile.read(reinterpret_cast<char *>(tff), MAX_CNT);
    if (inFile.eof())
    {
	size_t bytecnt = inFile.gcount();
	*(tff + bytecnt) = '\0';
	cout << "bytecnt " << bytecnt << endl;
    }
    else if(inFile.fail())
    {
	cout << filename << "read failed " << endl;
    }
    else
    {
	cout << filename << "is too large" << endl;
    }
    glGenTextures(1, texture);
    glBindTexture(GL_TEXTURE_1D, *texture);
    glTexParameteri(GL_TEXTURE_1D, GL_TEXTURE_WRAP_S, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_1D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_1D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    glTexImage1D(GL_TEXTURE_1D, 0, GL_RGBA8, 256, 0, GL_RGBA, GL_UNSIGNED_BYTE, tff);
    free(tff);
}

bool Texture::loadPngImage(const char *name, int &outWidth, int &outHeight, GLubyte **outData) {
    png_structp png_ptr;
    png_infop info_ptr;
    unsigned int sig_read = 0;
    int color_type, interlace_type;
    FILE *fp;

    if ((fp = fopen(name, "rb")) == NULL)
        return false;

    png_ptr = png_create_read_struct(PNG_LIBPNG_VER_STRING,
                                     NULL, NULL, NULL);

    if (png_ptr == NULL) {
        fclose(fp);
        return false;
    }

    info_ptr = png_create_info_struct(png_ptr);
    if (info_ptr == NULL) {
        fclose(fp);
        png_destroy_read_struct(&png_ptr, NULL, NULL);
        return false;
    }

    if (setjmp(png_jmpbuf(png_ptr))) {

        png_destroy_read_struct(&png_ptr, &info_ptr, NULL);
        fclose(fp);

        return false;
    }

    png_init_io(png_ptr, fp);

    png_set_sig_bytes(png_ptr, sig_read);

    png_read_png(png_ptr, info_ptr, PNG_TRANSFORM_STRIP_16 | PNG_TRANSFORM_PACKING | PNG_TRANSFORM_EXPAND, NULL);

    png_uint_32 width, height;
    int bit_depth;
    png_get_IHDR(png_ptr, info_ptr, &width, &height, &bit_depth, &color_type,
                 &interlace_type, NULL, NULL);
    outWidth = width;
    outHeight = height;

    unsigned int row_bytes = png_get_rowbytes(png_ptr, info_ptr);
    *outData = (unsigned char*) malloc(row_bytes * outHeight);

    png_bytepp row_pointers = png_get_rows(png_ptr, info_ptr);

    for (int i = 0; i < outHeight; i++) {
      memcpy(*outData + (row_bytes * i), row_pointers[i], row_bytes);
    }

    png_destroy_read_struct(&png_ptr, &info_ptr, NULL);

    fclose(fp);

    return true;
}

void Texture::loadImage(string pathToDir, GLuint* texture, int* width, int* height, int maxTexturesNumber)
{
  glEnable(GL_TEXTURE_2D);
  glGenTextures(maxTexturesNumber, texture);

  // stringstream ss;

  for (int i = 0; i < maxTexturesNumber; i++) {
    // ss << setfill('0') << setw(4) << i * 7;
    // string pathToFile = pathToDir + "slice_" + ss.str() + ".tif.png";
    // ss.str(string());
    string pathToFile = pathToDir + "slicemap_" + to_string(i) + ".png";
    // string pathToFile = pathToDir;
    cout << pathToFile << endl;
    glBindTexture(GL_TEXTURE_2D, texture[i]);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

    GLubyte *tempTexture;
    loadPngImage(pathToFile.c_str(), *width, *height, &tempTexture);

    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, *width, *height, 0, GL_RGBA, GL_UNSIGNED_BYTE, tempTexture);
    glGenerateMipmap(GL_TEXTURE_2D);

    delete [] tempTexture;
  }
}

void Texture::loadImage2(string pathToFile, GLuint* texture, int* width, int* height, int maxTexturesNumber)
{
  GLubyte *tempTexture;
  loadPngImage(pathToFile.c_str(), *width, *height, &tempTexture);

  glEnable(GL_TEXTURE_2D);
  glGenTextures(1, texture);
  glBindTexture(GL_TEXTURE_2D, *texture);

  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);

  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, *width, *height, 0, GL_RGBA, GL_UNSIGNED_BYTE, tempTexture);
  glGenerateMipmap(GL_TEXTURE_2D);

  delete [] tempTexture;
}
