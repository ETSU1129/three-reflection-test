#ifdef GL_ES
precision mediump float;
#endif

uniform float time;        // 時間。アニメーションなどの経過時間として使用
uniform float progress;    // 進行度を示すパラメータ(ここでは使用していない)
uniform sampler2D texture1;// テクスチャ(ここでは使用していない)
uniform vec4 resolution;   // 画面や領域の解像度情報(ここでは使用していない)
varying vec2 vUv;          // 頂点シェーダから受け取るUV座標
varying vec3 vPosition;    // 頂点シェーダから受け取る頂点座標(ワールドまたはモデル空間)

// πの定義
float PI = 3.141592653589793238;


//-----------------------------------------------------
// Simplex Noise 関数 (2D)
// (Ashima ArtsのWebGLノイズコードより引用)
//-----------------------------------------------------
// Perlin Noiseより高速でより美しい特徴を持つSimplex Noiseを実装
// この関数は、2次元座標 v に対して 0～1 の範囲のノイズ値を返す
// (実際は-1～1程度に分布するが、内部でスケールされている)
vec3 mod289(vec3 x) {
    return x - floor(x * (1.0/289.0))*289.0;
}
vec2 mod289(vec2 x) {
    return x - floor(x * (1.0/289.0))*289.0;
}
vec3 permute(vec3 x) {
    return mod289((x*34.0+1.0)*x);
}

float simplexNoise(vec2 v) {
    const float C = 0.211324865405187; // (3.0 - sqrt(3.0))/6.0 : simplex格子計算用定数
    vec2 i = floor(v + (v.x+v.y)*0.366025403784439);
    vec2 x0 = v - i + (i.x+i.y)*C;
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec2 x1 = x0 - i1 + C;
    vec2 x2 = x0 - 1.0 + 2.0*C;

    i = mod289(i);
    vec3 p = permute( permute(
        i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0)
    );

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
    m = m*m;
    m = m*m;

    vec3 x = 2.0*fract(p*(1.0/41.0)) -1.0;
    vec3 h = abs(x)-0.5;
    vec3 ox = floor(x+0.5);
    vec3 a0 = x -ox;

    m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.y = a0.y * x1.x + h.y * x1.y;
    g.z = a0.z * x2.x + h.z * x2.y;
    return 130.0 * dot(m,g);
}
//-----------------------------------------------------

//-----------------------------------------------------
// ラインパターン生成関数
// uv: 対象となるUV座標
// offset: パターン強度や位相調整用パラメータ
// sin関数を用いて繰り返しライン模様を生成し、smoothstepで柔らかく補間
//-----------------------------------------------------
float lines(vec2 uv, float offset){
	return smoothstep(
		0.0, 
        0.5 + offset*0.5,
		0.5*abs((sin(uv.x*35.0) + offset*2.0))
	);
}

//-----------------------------------------------------
// 2D回転行列を返す関数
// angle: 回転角度(ラジアン)
//-----------------------------------------------------
mat2 rotate2D(float angle){
	return mat2(
		cos(angle), -sin(angle),
		sin(angle),  cos(angle)
	);
}

//-----------------------------------------------------
// main関数: フラグメントシェーダ本体
//-----------------------------------------------------
void main() {
    // 柔らかなパステル調のカラーパレットを設定
    vec3 baseFirst  = vec3(120.0/255.0, 197.0/255.0, 214.0/255.0); // 柔らかな水色
    vec3 accent     = vec3(0.0, 0.0, 0.0);                        // 黒(アクセント)
    vec3 baseSecond = vec3(255.0/255.0,170.0/255.0,166.0/255.0);  // パステルコーラル
    vec3 baseThird  = vec3(255.0/255.0,211.0/255.0,181.0/255.0);  // 優しいクリームイエロー

    // Simplex Noiseを利用し、vPosition.xyに時間変数を加えて揺らぎを生成
    // 0.2倍でスケールダウンし、0.2*timeでノイズパターンが時間で移動する
    float n = simplexNoise(vPosition.xy * 0.2 + time*0.2);

    // ノイズ値nを回転角として使用し、vPosition.xyを回転・スケーリングしてベースUVを作成
    vec2 baseUV = rotate2D(n) * vPosition.xy * 0.1;

    // ベースパターンとセカンドパターンを生成
    float basePattern = lines(baseUV, 0.5);
    float secondPattern = lines(baseUV, 0.1);

    // baseSecondとbaseFirstをbasePatternで補間し、さらにsecondPatternでaccentを混ぜる
    vec3 baseColor = mix(baseSecond, baseFirst, basePattern);
    vec3 secondBaseColor = mix(baseColor, accent, secondPattern);

    // 出力ピクセルカラーとして設定
    gl_FragColor = vec4(vec3(secondBaseColor), 1.0);
}
