import React, { useEffect, useState } from "react";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import Loader from "../../Components/Loader/Loader";
import NotFoundCart from "../../Components/NotFoundCart/NotFoundCart";
import { useDispatch, useSelector } from "react-redux";
import { getSmartRecommendationAction } from "../../Redux/Actions/productAction";
import { FaCartPlus } from "react-icons/fa";
import { addToCartAction } from "../../Redux/Actions/cartAction";
import { BsCartXFill } from "react-icons/bs";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Box,
  Grid
} from "@mui/material";
import { motion } from "framer-motion";
import "./smartRecommendation.css";

const SmartRecommendation = () => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(0.5);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { loading, recommendations, error } = useSelector(
    (state) => state.smartRecommendation
  );

  const { cartItems } = useSelector((state) => state.userCart);

  useEffect(() => {
    dispatch(getSmartRecommendationAction());
  }, [dispatch]);

  const handleSearch = (products) => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderProductCard = (product) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
        <Card className="mui-card" sx={{ m: 1, borderRadius: "16px" }}>
          <CardMedia
            component="img"
            height="160"
            image={product.url}
            alt={product.name}
          />
          <CardContent>
            <Typography variant="h6">{product.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              ₹ {product.rate}/Kg
            </Typography>

            <Box mt={2}>
              {product.stocks <= 0 ? (
                <Typography color="error" fontWeight="bold">
                  OUT OF STOCK <BsCartXFill />
                </Typography>
              ) : (
                <>
                  <FormControl fullWidth size="small">
                    <InputLabel>Qty</InputLabel>
                    <Select
                      label="Qty"
                      defaultValue={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    >
                      {product.kilogramOption.map((weight) => (
                        <MenuItem
                          key={weight.$numberDecimal}
                          value={weight.$numberDecimal}
                        >
                          {weight.$numberDecimal} Kg
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={() =>
                      dispatch(addToCartAction(product._id, quantity))
                    }
                    startIcon={<FaCartPlus />}
                  >
                    Add to Cart
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );

  const renderCategorySection = (title, productArray) =>
    productArray?.length > 0 && (
      <div className="category-section">
        <Typography variant="h5" sx={{ my: 2 }}>
          {title}
        </Typography>
        <Grid container spacing={2}>
          {handleSearch(productArray).map(renderProductCard)}
        </Grid>
      </div>
    );

  return (
    <>
      <Header />
      {loading ? (
        <Loader LoadingName="Fetching Recommendations..." />
      ) : (
        <Box className="products-container" px={10} py={4}>
          <Typography variant="h4" gutterBottom className="Heading regHeading">
            Smart <span style={{ color: "#1976d2" }}>Recommendations</span>
          </Typography>

          {/* Search Input */}
          <TextField
            label="Search Products"
            variant="outlined"
            fullWidth
            sx={{ mb: 3 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Category Filter */}
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Filter by Category</InputLabel>
            <Select
              label="Filter by Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              {recommendations?.productsByCategory &&
                Object.keys(recommendations.productsByCategory).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {error ? (
            <NotFoundCart msg="Something went wrong. Try again later!" />
          ) : recommendations ? (
            <div className="products-list">
              {/* Always visible fixed sections */}
              {renderCategorySection("🔥 Trending Products", recommendations.trendingProducts)}
              {renderCategorySection("🆕 Latest Products", recommendations.latestProducts)}
              {renderCategorySection("⚠️ Low Stock Products", recommendations.lowStockProducts)}

              {/* Filtered Category Sections */}
              {recommendations.productsByCategory &&
                Object.entries(recommendations.productsByCategory)
                  .filter(
                    ([categoryName]) =>
                      selectedCategory === "All" || selectedCategory === categoryName
                  )
                  .map(([categoryName, products]) =>
                    renderCategorySection(`📦 ${categoryName}`, products)
                  )}
            </div>
          ) : (
            <NotFoundCart msg="No Recommendations Found" />
          )}
        </Box>
      )}
      <Footer />
    </>
  );
};

export default SmartRecommendation;
