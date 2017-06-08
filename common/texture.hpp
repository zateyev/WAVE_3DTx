#ifndef TEXTURE_HPP
#define TEXTURE_HPP

bool loadPngImage(const char *name, int &outWidth, int &outHeight, GLubyte **outData);
void loadImage(std::string pathToDir, GLuint* texture, int* width, int* height, int maxTexturesNumber);
void loadImage2(std::string pathToFile, GLuint* texture, int* width, int* height, int maxTexturesNumber);
void initVol3DTex(const char* filename, GLuint* texture, GLuint w, GLuint h, GLuint d);
void initTFF1DTex(const char* filename, GLuint* texture);

#endif
