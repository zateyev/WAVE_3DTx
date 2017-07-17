#include "common/Dwave.hpp"

int main(int argc, char** argv) {
  dwave::Dwave dwave;
  dwave.startDwave(argc, argv);
  return EXIT_SUCCESS;
}
