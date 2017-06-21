#ifndef SHADER_HPP
#define SHADER_HPP

class Shader {
  private:
    GLuint g_programHandle;

    static GLboolean compileCheck(GLuint shader);
    static GLint checkShaderLinkStatus(GLuint pgmHandle);

  public:
    GLuint get_programHandle();

    void setUniform(const GLchar* var, float val);
    void setUniform(const GLchar* var, int val);
    void setUniform(const GLchar *var, GLenum target, GLuint texture, GLint v0);
    static GLuint initShaderObj(const GLchar* srcfile, GLenum shaderType);
    void createShaderPgm();
    static void linkShader(GLuint shaderPgm, GLuint newVertHandle, GLuint newFragHandle);
};

#endif
