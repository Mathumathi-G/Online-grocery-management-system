// Redux/Reducers/smartRecommendationReducer.js

const initialState = {
    loading: false,
    recommendations: [],
    error: null,
  };
  
  export const smartRecommendationReducer = (state = initialState, action) => {
    switch (action.type) {
      case "SMART_RECOMMENDATION_REQUEST":
        return {
          ...state,
          loading: true,
          error: null,
        };
  
      case "SMART_RECOMMENDATION_SUCCESS":
        return {
          ...state,
          loading: false,
          recommendations: action.payload,
        };
  
      case "SMART_RECOMMENDATION_FAIL":
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      default:
        return state;
    }
  };
  