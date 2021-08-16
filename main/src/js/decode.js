// This is file decode.js
"use strict"

var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
var codes_0to9 = 'eighqDNYAL';
var n = characters.length;

// generate permutations
function init_permutation(n) {
    var p = [];
    var q = [];
    for (var i = 0; i < n; i++) {
        p[i] = i;
        q[i] = i;
    }
    return [p, q];
}

/**
 * This function swaps p[i] and p[j] and
 * also q[ii] and q[jj] of the inverse q of p.<br>
 * Example: i = 3 and j = 7. p[3] = 11 and p[7] = 2
 * Then q[11] = 3 and q[2] = 7<br>
 * After swap of p ii = p[3] = 2 and jj = p[7] = 11.
 * After swap of q q[2] = 3 and q[11] = 7 
 * @param p Array of integers
 * @param q Array of integers
 * @param i integer, j integer
 * @returns {} Arrays p and q .
 */
function swap(p, q, i, j) {
    var h = p[i];
    p[i] = p[j];
    p[j] = h;
    var ii = p[i];
    var jj = p[j];
    h = q[ii];
    q[ii] = q[jj];
    q[jj] = h;
}

function random_swap(p, q, n) {
    var i = Math.floor(Math.random() * n);
    var j = Math.floor(Math.random() * n);
    swap(p, q, i, j);
}

// perm[enc_dec][num_of_perm][index]
// enc_dec = 0 for encoding =1 for decoding
// num_of_perm = number of permutation, 0 to 9. You can choose one of ten permutations
var perm = [];
perm[0] = [];
perm[1] = [];
// Activate function init(){ create_permutations(); } in file decode_encode.php and copy textarea output to this place:
perm[0][0] = [0, 16, 20, 40, 55, 60, 33, 41, 62, 56, 8, 36, 19, 22, 15, 38, 23, 13, 61, 52, 4, 58, 46, 59, 2, 21, 24, 17, 64, 29, 37, 18, 27, 50, 32, 35, 9, 57, 49, 14, 43, 11, 48, 5, 28, 25, 39, 63, 3, 34, 51, 12, 1, 45, 42, 7, 31, 10, 54, 26, 44, 53, 47, 30, 6];
perm[1][0] = [0, 52, 24, 48, 20, 43, 64, 55, 10, 36, 57, 41, 51, 17, 39, 14, 1, 27, 31, 12, 2, 25, 13, 16, 26, 45, 59, 32, 44, 29, 63, 56, 34, 6, 49, 35, 11, 30, 15, 46, 3, 7, 54, 40, 60, 53, 22, 62, 42, 38, 33, 50, 19, 61, 58, 4, 9, 37, 21, 23, 5, 18, 8, 47, 28];
perm[0][1] = [15, 51, 47, 39, 10, 30, 44, 26, 63, 62, 17, 45, 24, 54, 33, 11, 56, 37, 2, 14, 40, 19, 43, 36, 38, 34, 9, 29, 4, 58, 48, 59, 13, 52, 1, 8, 18, 57, 61, 6, 32, 49, 42, 5, 12, 50, 21, 46, 20, 16, 28, 64, 22, 3, 27, 35, 53, 0, 31, 41, 60, 25, 23, 7, 55];
perm[1][1] = [57, 34, 18, 53, 28, 43, 39, 63, 35, 26, 4, 15, 44, 32, 19, 0, 49, 10, 36, 21, 48, 46, 52, 62, 12, 61, 7, 54, 50, 27, 5, 58, 40, 14, 25, 55, 23, 17, 24, 3, 20, 59, 42, 22, 6, 11, 47, 2, 30, 41, 45, 1, 33, 56, 13, 64, 16, 37, 29, 31, 60, 38, 9, 8, 51];
perm[0][2] = [6, 20, 8, 31, 48, 21, 43, 16, 10, 9, 44, 51, 14, 58, 54, 0, 41, 45, 64, 35, 39, 5, 52, 59, 53, 7, 62, 25, 60, 33, 61, 28, 15, 36, 50, 17, 22, 34, 38, 37, 56, 29, 18, 40, 57, 63, 4, 32, 26, 46, 19, 23, 12, 1, 24, 27, 49, 47, 42, 30, 3, 2, 11, 55, 13];
perm[1][2] = [15, 53, 61, 60, 46, 21, 0, 25, 2, 9, 8, 62, 52, 64, 12, 32, 7, 35, 42, 50, 1, 5, 36, 51, 54, 27, 48, 55, 31, 41, 59, 3, 47, 29, 37, 19, 33, 39, 38, 20, 43, 16, 58, 6, 10, 17, 49, 57, 4, 56, 34, 11, 22, 24, 14, 63, 40, 44, 13, 23, 28, 30, 26, 45, 18];
perm[0][3] = [42, 17, 22, 13, 49, 50, 30, 1, 14, 2, 64, 28, 60, 54, 57, 10, 25, 7, 61, 26, 8, 59, 43, 19, 35, 18, 58, 33, 6, 38, 5, 62, 34, 16, 11, 27, 9, 29, 24, 44, 41, 45, 23, 3, 46, 63, 31, 40, 53, 0, 47, 21, 51, 32, 36, 12, 55, 15, 56, 52, 48, 37, 4, 39, 20];
perm[1][3] = [49, 7, 9, 43, 62, 30, 28, 17, 20, 36, 15, 34, 55, 3, 8, 57, 33, 1, 25, 23, 64, 51, 2, 42, 38, 16, 19, 35, 11, 37, 6, 46, 53, 27, 32, 24, 54, 61, 29, 63, 47, 40, 0, 22, 39, 41, 44, 50, 60, 4, 5, 52, 59, 48, 13, 56, 58, 14, 26, 21, 12, 18, 31, 45, 10];
perm[0][4] = [41, 6, 40, 24, 38, 36, 59, 25, 48, 47, 19, 29, 31, 60, 17, 16, 56, 12, 52, 33, 21, 43, 57, 50, 34, 51, 8, 55, 42, 32, 54, 4, 23, 26, 1, 22, 63, 28, 10, 64, 7, 30, 14, 27, 46, 44, 9, 61, 62, 49, 45, 18, 39, 35, 53, 3, 13, 5, 0, 58, 37, 20, 2, 15, 11];
perm[1][4] = [58, 34, 62, 55, 31, 57, 1, 40, 26, 46, 38, 64, 17, 56, 42, 63, 15, 14, 51, 10, 61, 20, 35, 32, 3, 7, 33, 43, 37, 11, 41, 12, 29, 19, 24, 53, 5, 60, 4, 52, 2, 0, 28, 21, 45, 50, 44, 9, 8, 49, 23, 25, 18, 54, 30, 27, 16, 22, 59, 6, 13, 47, 48, 36, 39];
perm[0][5] = [51, 3, 48, 22, 40, 52, 15, 54, 32, 5, 61, 29, 8, 36, 12, 23, 20, 1, 62, 46, 0, 64, 43, 34, 58, 30, 26, 56, 11, 50, 4, 39, 47, 24, 14, 59, 10, 28, 21, 53, 41, 35, 42, 16, 45, 31, 17, 7, 37, 9, 18, 13, 6, 38, 25, 49, 33, 27, 44, 63, 60, 19, 2, 57, 55];
perm[1][5] = [20, 17, 62, 1, 30, 9, 52, 47, 12, 49, 36, 28, 14, 51, 34, 6, 43, 46, 50, 61, 16, 38, 3, 15, 33, 54, 26, 57, 37, 11, 25, 45, 8, 56, 23, 41, 13, 48, 53, 31, 4, 40, 42, 22, 58, 44, 19, 32, 2, 55, 29, 0, 5, 39, 7, 64, 27, 63, 24, 35, 60, 10, 18, 59, 21];
perm[0][6] = [62, 21, 8, 33, 20, 12, 49, 56, 15, 60, 38, 26, 54, 46, 5, 16, 19, 44, 34, 41, 63, 23, 22, 13, 39, 0, 14, 57, 42, 27, 45, 6, 51, 55, 1, 32, 52, 18, 24, 30, 36, 43, 3, 10, 4, 37, 28, 58, 64, 31, 47, 29, 35, 48, 11, 40, 50, 53, 9, 25, 61, 7, 17, 59, 2];
perm[1][6] = [25, 34, 64, 42, 44, 14, 31, 61, 2, 58, 43, 54, 5, 23, 26, 8, 15, 62, 37, 16, 4, 1, 22, 21, 38, 59, 11, 29, 46, 51, 39, 49, 35, 3, 18, 52, 40, 45, 10, 24, 55, 19, 28, 41, 17, 30, 13, 50, 53, 6, 56, 32, 36, 57, 12, 33, 7, 27, 47, 63, 9, 60, 0, 20, 48];
perm[0][7] = [60, 26, 3, 48, 16, 27, 13, 14, 30, 21, 53, 8, 12, 54, 45, 46, 20, 11, 42, 39, 61, 47, 52, 43, 31, 38, 57, 40, 28, 6, 25, 1, 2, 7, 23, 36, 58, 10, 29, 9, 55, 22, 44, 19, 0, 64, 56, 41, 18, 32, 17, 35, 5, 62, 4, 50, 37, 59, 34, 15, 49, 24, 33, 63, 51];
perm[1][7] = [44, 31, 32, 2, 54, 52, 29, 33, 11, 39, 37, 17, 12, 6, 7, 59, 4, 50, 48, 43, 16, 9, 41, 34, 61, 30, 1, 5, 28, 38, 8, 24, 49, 62, 58, 51, 35, 56, 25, 19, 27, 47, 18, 23, 42, 14, 15, 21, 3, 60, 55, 64, 22, 10, 13, 40, 46, 26, 36, 57, 0, 20, 53, 63, 45];
perm[0][8] = [58, 28, 2, 60, 29, 54, 37, 40, 6, 50, 62, 19, 35, 63, 31, 44, 30, 17, 48, 22, 41, 0, 11, 38, 32, 13, 46, 57, 39, 23, 15, 3, 16, 5, 64, 10, 56, 27, 42, 20, 61, 34, 43, 45, 1, 49, 33, 51, 52, 14, 25, 53, 24, 7, 21, 26, 59, 36, 12, 8, 9, 55, 4, 47, 18];
perm[1][8] = [21, 44, 2, 31, 62, 33, 8, 53, 59, 60, 35, 22, 58, 25, 49, 30, 32, 17, 64, 11, 39, 54, 19, 29, 52, 50, 55, 37, 1, 4, 16, 14, 24, 46, 41, 12, 57, 6, 23, 28, 7, 20, 38, 42, 15, 43, 26, 63, 18, 45, 9, 47, 48, 51, 5, 61, 36, 27, 0, 56, 3, 40, 10, 13, 34];
perm[0][9] = [53, 64, 29, 11, 26, 0, 20, 21, 48, 19, 5, 60, 14, 59, 4, 61, 58, 9, 44, 63, 3, 49, 33, 22, 2, 35, 31, 18, 28, 41, 40, 50, 7, 46, 34, 56, 24, 32, 13, 42, 30, 45, 47, 54, 15, 38, 8, 16, 12, 23, 52, 51, 39, 17, 62, 36, 25, 1, 37, 10, 57, 6, 43, 55, 27];
perm[1][9] = [5, 57, 24, 20, 14, 10, 61, 32, 46, 17, 59, 3, 48, 38, 12, 44, 47, 53, 27, 9, 6, 7, 23, 49, 36, 56, 4, 64, 28, 2, 40, 26, 37, 22, 34, 25, 55, 58, 45, 52, 30, 29, 39, 62, 18, 41, 33, 42, 8, 21, 31, 51, 50, 0, 43, 63, 35, 60, 16, 13, 11, 15, 54, 19, 1];
// console.log(perm[1][8][4]); -> 62

function encode_decode_char(enc_dec, num_of_perm, char) {
    var code_1 = characters.indexOf(char);
    // console.log(code_1);
    var code_2 = perm[enc_dec][num_of_perm][code_1];
    // console.log(code_2);
    var result = characters[code_2];
    return result;
}

function encode_decode_string(enc_dec, num_of_perm, str) {
    var result = '';
    var len = str.length;
    for (var i = 0; i < len; i++) {
        result += encode_decode_char(enc_dec, num_of_perm, str[i]);
    }
    return result;
}

// base64 encoding/decoding

// https://attacomsian.com/blog/javascript-base64-encode-decode
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
// https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
function encodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

function decodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

var oldText;
var oldN;

function encode(text) {
    // console.log(oldText, text);
    if (oldText == text) {
        var n = oldN; // do not change n
    } else {
        var n = Math.floor(Math.random() * 10);
    }
    var h = encodeUnicode(text);
    oldText = text;
    oldN = n;
    return codes_0to9[n] + encode_decode_string(0, n, h);
}

function decode(text) {
    var n = codes_0to9.indexOf(text.substr(0, 1));
    var h = encode_decode_string(1, n, text.substr(1));
    var result = decodeUnicode(h);
    return result;
}