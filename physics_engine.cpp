#include <emscripten/bind.h>

using namespace emscripten;

// High-speed structural math that JavaScript is too slow for
float calculate_stress(float force, float area) {
    if (area <= 0) return 0;
    return force / area;
}

EMSCRIPTEN_BINDINGS(my_module) {
    function("calculate_stress", &calculate_stress);
}
