#include <emscripten.h>

extern "C" {

    // Simplified for maximum compatibility
    EMSCRIPTEN_KEEPALIVE
    float calculate_stress(float force, float area) {
        if (area <= 0) return 0.0f;
        return force / area;
    }

    EMSCRIPTEN_KEEPALIVE
    float calculate_displacement(float force, float length, float area, float modulus) {
        if (area <= 0 || modulus <= 0) return 0.0f;
        return (force * length) / (area * modulus);
    }

}
