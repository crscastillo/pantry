-- Create recipes table
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  servings INTEGER NOT NULL DEFAULT 4,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  instructions TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  cuisine TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_ingredients table
CREATE TABLE recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  pantry_item_id UUID REFERENCES pantry_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Policies for recipes
CREATE POLICY "Users can view own recipes" ON recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for recipe_ingredients
CREATE POLICY "Users can view ingredients for own recipes" ON recipe_ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_ingredients.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ingredients for own recipes" ON recipe_ingredients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_ingredients.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ingredients for own recipes" ON recipe_ingredients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_ingredients.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ingredients for own recipes" ON recipe_ingredients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_ingredients.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_pantry_item_id ON recipe_ingredients(pantry_item_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_recipes_timestamp
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_recipes_updated_at();
