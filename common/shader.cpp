#include <fstream>
#include <iostream>
#include <GL/glew.h>
#include <include/GL/gl.h>
#include "shader.hpp"

using namespace std;

void Shader::setUniform(const GLchar* var, float val) {
  GLint location = glGetUniformLocation(g_programHandle, var);
  if (location >= 0) glUniform1f(location, val);
  else cout << var << " is not bind to the uniform\n";
}

void Shader::setUniform(const GLchar* var, int val) {
  GLint location = glGetUniformLocation(g_programHandle, var);
  if (location >= 0) glUniform1i(location, val);
  else cout << var << " is not bind to the uniform\n";
}

void Shader::setUniform(const GLchar *var, GLenum target, GLuint texture, GLint v0) {
  GLint location = glGetUniformLocation(g_programHandle, var);
  if (location >= 0)
  {
    	glActiveTexture(GL_TEXTURE0 + v0);
    	glBindTexture(target, texture);
    	glUniform1i(location, v0);
  }
  else cout << var << " is not bind to the uniform\n";
}

GLuint Shader::get_programHandle() {
  return g_programHandle;
}

// check the compilation result
GLboolean Shader::compileCheck(GLuint shader)
{
    GLint err;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &err);
    if (GL_FALSE == err)
    {
    	GLint logLen;
    	glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &logLen);
    	if (logLen > 0)
    	{
  	    char* log = (char *)malloc(logLen);
  	    GLsizei written;
  	    glGetShaderInfoLog(shader, logLen, &written, log);
  	    cerr << "Shader log: " << log << endl;
  	    free(log);
    	}
    }
    return err;
}

// init shader object
GLuint Shader::initShaderObj(const GLchar* srcfile, GLenum shaderType)
{
    ifstream inFile(srcfile, ifstream::in);
    // use assert?
    if (!inFile)
    {
    	cerr << "Error openning file: " << srcfile << endl;
    	exit(EXIT_FAILURE);
    }

    const int MAX_CNT = 20000;
    GLchar *shaderCode = (GLchar *) calloc(MAX_CNT, sizeof(GLchar));
    inFile.read(shaderCode, MAX_CNT);
    if (inFile.eof())
    {
    	size_t bytecnt = inFile.gcount();
    	*(shaderCode + bytecnt) = '\0';
    }
    else if(inFile.fail()) cout << srcfile << "read failed \n";
    else cout << srcfile << "is too large\n";
    // create the shader Object
    GLuint shader = glCreateShader(shaderType);
    if (0 == shader) cerr << "Error creating vertex shader.\n";
    const GLchar* codeArray[] = {shaderCode};
    glShaderSource(shader, 1, codeArray, NULL);
    free(shaderCode);

    // compile the shader
    glCompileShader(shader);
    if (GL_FALSE == compileCheck(shader)) cerr << "shader compilation failed\n";
    return shader;
}

// link shader program
void Shader::createShaderPgm()
{
    // Create the shader program
    g_programHandle = glCreateProgram();
    if (0 == g_programHandle)
    {
    	cerr << "Error create shader program" << endl;
    	exit(EXIT_FAILURE);
    }
}

GLint Shader::checkShaderLinkStatus(GLuint pgmHandle)
{
    GLint status;
    glGetProgramiv(pgmHandle, GL_LINK_STATUS, &status);
    if (GL_FALSE == status)
    {
    	GLint logLen;
    	glGetProgramiv(pgmHandle, GL_INFO_LOG_LENGTH, &logLen);
    	if (logLen > 0)
    	{
    	    GLchar * log = (GLchar *)malloc(logLen);
    	    GLsizei written;
    	    glGetProgramInfoLog(pgmHandle, logLen, &written, log);
    	    cerr << "Program log: " << log << endl;
    	}
    }
    return status;
}

// link the shader objects using the shader program
void Shader::linkShader(GLuint shaderPgm, GLuint newVertHandle, GLuint newFragHandle)
{
    const GLsizei maxCount = 2;
    GLsizei count;
    GLuint shaders[maxCount];
    glGetAttachedShaders(shaderPgm, maxCount, &count, shaders);

    // GL_ERROR();
    for (int i = 0; i < count; i++) {
	     glDetachShader(shaderPgm, shaders[i]);
    }
    // Bind index 0 to the shader input variable "VerPos"
    glBindAttribLocation(shaderPgm, 0, "position");
    // Bind index 1 to the shader input variable "VerClr"
    glBindAttribLocation(shaderPgm, 1, "vertColor");
    // GL_ERROR();
    glAttachShader(shaderPgm,newVertHandle);
    glAttachShader(shaderPgm,newFragHandle);
    // GL_ERROR();
    glLinkProgram(shaderPgm);
    if (GL_FALSE == checkShaderLinkStatus(shaderPgm))
    {
    	cerr << "Failed to relink shader program!" << endl;
    	exit(EXIT_FAILURE);
    }
    // GL_ERROR();
}
