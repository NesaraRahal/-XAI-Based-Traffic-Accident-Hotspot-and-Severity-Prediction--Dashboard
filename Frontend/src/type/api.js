/**
 * @typedef {Object} ShapFeature
 * @property {string} feature
 * @property {string} label
 * @property {number|string|null} value
 * @property {number} shap
 * @property {string} direction
 */

/**
 * @typedef {Object} CellSummary
 * @property {string} h3_cell
 * @property {string} year_month
 * @property {number} cell_lat
 * @property {number} cell_lng
 * @property {string|null} police_division
 * @property {boolean} hotspot_predicted
 * @property {number} hotspot_probability
 * @property {string} severity_predicted_class
 * @property {boolean} observed_is_hotspot
 * @property {number} observed_accident_count
 */

/**
 * @typedef {Object} CellPrediction
 * @property {string} h3_cell
 * @property {string} year_month
 * @property {string} generated_at
 * @property {{cell_lat:number, cell_lng:number, police_division:string|null}} location
 * @property {{predicted:boolean, probability:number, threshold:number, top_shap_features:ShapFeature[]}} hotspot
 * @property {{predicted_class:string, class_probabilities:Object.<string,number>, top_shap_features:ShapFeature[]}} severity
 * @property {{accidents_180d:number, severity_mix_180d:Object.<string,number>|null}} historical_context
 * @property {{accident_count:number, is_hotspot:boolean, severity_defined:boolean, dominant_severity:string|null}} observed
 * @property {{hotspot_model:string, severity_model:string, evaluation_window:string}} model_metadata
 */

export {};