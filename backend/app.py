from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from datetime import datetime, date
import os
import io
import csv
import json  # <--- ADDED: Required to parse the products array from FormData
from sqlalchemy import or_, func, desc, asc

from config import config
from models import (
    db, User, Organization, Barangay, AgriculturalProduct, Farmer, 
    FarmerProduct, FarmerChild, FarmerExperience, ResearchProject,
    SurveyQuestionnaire, ActivityLog
)

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Define allowed extensions for image upload
    app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    # Ensure UPLOAD_FOLDER is set
    app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads')

    # Initialize extensions (SQLAlchemy)
    db.init_app(app)
    
    # Allow specific origin for CORS (Added 5173 for Vite default, 3000 for React default)
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:5173"]}}, supports_credentials=True)
    jwt = JWTManager(app)
    
    # Create upload folder immediately
    try:
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        print(f"📁 Verified Upload folder at: {app.config['UPLOAD_FOLDER']}")
    except Exception as e:
        print(f"❌ Error creating upload folder: {e}")
    
    # Helper functions
    def log_activity(action, entity_type=None, entity_id=None, details=None):
        try:
            user_id = get_jwt_identity()
            str_entity_id = str(entity_id) if entity_id else None
            
            log = ActivityLog(
                user_id=user_id,
                action=action,
                entity_type=entity_type,
                entity_id=str_entity_id,
                details=details,
                ip_address=request.remote_addr
            )
            db.session.add(log)
            db.session.commit()
        except Exception as e:
            print(f"Logging error: {e}")
            db.session.rollback()
            pass
    
    def allowed_file(filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']
    
    def save_profile_image(file):
        """
        Save uploaded profile image and return the filename.
        Returns None if file is invalid.
        """
        if file and file.filename:  # Check if file exists and has a filename
            if allowed_file(file.filename):
                # Create unique filename with timestamp
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                original_filename = secure_filename(file.filename)
                filename = f"{timestamp}_{original_filename}"
                
                # Save file to disk
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                try:
                    file.save(filepath)
                    print(f"✅ Image saved: {filename} at {filepath}")
                    return filename
                except Exception as e:
                    print(f"❌ Error saving file: {e}")
                    return None
            else:
                print(f"❌ Invalid file type: {file.filename}")
        else:
            print("❌ No file or filename provided")
        return None
    
    def delete_profile_image(filename):
        """
        Delete a profile image file from the uploads folder.
        """
        if filename:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                    print(f"🗑️ Deleted old image: {filename}")
                    return True
                except Exception as e:
                    print(f"Error deleting file {filename}: {e}")
        return False
    
    # ============ Static File Serving (Images) ============
    @app.route('/static/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # ============ Authentication Routes ============
    
    @app.route('/api/auth/register', methods=['POST'])
    @jwt_required()
    def register():
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        user = User(
            username=data['username'],
            email=data['email'],
            full_name=data['full_name'],
            role=data['role'],
            organization_id=data.get('organization') 
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        log_activity('USER_CREATED', 'User', user.id, f"Created user: {user.username}")
        
        return jsonify({'message': 'User created successfully', 'user': user.to_dict()}), 201
    
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is inactive'}), 403
        
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        log_activity('USER_LOGIN', 'User', user.id)
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 200
    
    @app.route('/api/auth/refresh', methods=['POST'])
    @jwt_required(refresh=True)
    def refresh():
        user_id = get_jwt_identity()
        access_token = create_access_token(identity=user_id)
        return jsonify({'access_token': access_token}), 200
    
    @app.route('/api/auth/me', methods=['GET'])
    @jwt_required()
    def get_current_user():
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        return jsonify(user.to_dict()), 200
    
    # ============ Dashboard Routes ============
    
    @app.route('/api/dashboard/stats', methods=['GET'])
    @jwt_required()
    def get_dashboard_stats():
        total_farmers = Farmer.query.count()
        total_barangays = Barangay.query.count()
        total_products = AgriculturalProduct.query.count()
        total_experiences = FarmerExperience.query.count()
        total_projects = ResearchProject.query.count()
        
        children_farming = FarmerChild.query.filter_by(continues_farming=True).count()
        total_children = FarmerChild.query.count()
        
        recent_activities = ActivityLog.query.order_by(ActivityLog.created_at.desc()).limit(10).all()
        
        education_stats_query = db.session.query(
            Farmer.education_level, func.count(Farmer.id)
        ).group_by(Farmer.education_level).all()
        
        education_stats = [{'level': level, 'count': count} for level, count in education_stats_query]
        
        product_stats_query = db.session.query(
            Barangay.name, func.count(Farmer.id)
        ).join(Farmer.barangay).group_by(Barangay.name).order_by(func.count(Farmer.id).desc()).limit(5).all()
        
        product_stats = [{'barangay': name, 'count': count} for name, count in product_stats_query]
        
        return jsonify({
            'total_farmers': total_farmers,
            'total_barangays': total_barangays,
            'total_products': total_products,
            'total_experiences': total_experiences,
            'total_projects': total_projects,
            'children_farming': children_farming,
            'total_children': total_children,
            'recent_activities': [log.to_dict() for log in recent_activities],
            'education_stats': education_stats,
            'product_stats': product_stats
        }), 200
    
    # ============ Farmer Routes ============
    
    @app.route('/api/farmers', methods=['GET'])
    @jwt_required()
    def get_farmers():
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', app.config.get('ITEMS_PER_PAGE', 20), type=int)
        search = request.args.get('search', '')
        barangay_id = request.args.get('barangay_id')
        
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        query = Farmer.query
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Farmer.first_name.ilike(search_term),
                    Farmer.last_name.ilike(search_term),
                    Farmer.farmer_code.ilike(search_term)
                )
            )
        
        if barangay_id:
            query = query.filter(Farmer.barangay_id == barangay_id)
        
        if hasattr(Farmer, sort_by):
            col = getattr(Farmer, sort_by)
            if sort_order == 'asc':
                query = query.order_by(col.asc())
            else:
                query = query.order_by(col.desc())
        else:
            query = query.order_by(Farmer.created_at.desc())

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'farmers': [farmer.to_dict(include_relations=True) for farmer in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
    
    @app.route('/api/farmers/<int:id>', methods=['GET'])
    @jwt_required()
    def get_farmer(id):
        farmer = Farmer.query.get_or_404(id)
        
        products = FarmerProduct.query.filter_by(farmer_id=id).all()
        children = FarmerChild.query.filter_by(farmer_id=id).all()
        experiences = FarmerExperience.query.filter_by(farmer_id=id).all()
        
        data = farmer.to_dict(include_relations=True)
        # Manually attach related data if not included in to_dict
        data['products'] = [p.to_dict() for p in products]
        data['children'] = [c.to_dict() for c in children]
        data['experiences'] = [e.to_dict() for e in experiences]
        
        return jsonify(data), 200
    
    @app.route('/api/farmers', methods=['POST'])
    @jwt_required()
    def create_farmer():
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'researcher', 'data_encoder']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        try:
            # Get form data
            data = request.form.to_dict()
            
            # Helper to convert values
            def get_val(key, type_cast=None, default=None):
                val = data.get(key)
                if val == '' or val == 'null' or val is None:
                    return default
                if type_cast:
                    try:
                        return type_cast(val)
                    except (ValueError, TypeError):
                        return default
                return val

            # --- STEP 1: Handle Image Upload ---
            profile_image_filename = None
            if 'profile_image' in request.files:
                file = request.files['profile_image']
                if file and file.filename != '':
                    profile_image_filename = save_profile_image(file)

            # Handle Date
            birth_date_val = None
            if data.get('birth_date'):
                try:
                    birth_date_val = datetime.strptime(data['birth_date'][:10], '%Y-%m-%d').date()
                except (ValueError, TypeError):
                    pass

            # --- STEP 2: Save Farmer to Database ---
            farmer = Farmer(
                farmer_code=data.get('farmer_code'),
                first_name=data.get('first_name'),
                middle_name=get_val('middle_name'),
                last_name=data.get('last_name'),
                suffix=get_val('suffix'),
                age=get_val('age', int),
                gender=data.get('gender', 'Male'),
                profile_image=profile_image_filename,
                birth_date=birth_date_val,
                barangay_id=get_val('barangay_id', int),
                organization_id=get_val('organization_id', int),
                data_encoder_id=current_user.id,
                address=data.get('address'),
                contact_number=data.get('contact_number'),
                education_level=data.get('education_level', 'Elementary'),
                annual_income=get_val('annual_income', float),
                income_source=data.get('income_source'),
                number_of_children=get_val('number_of_children', int, 0),
                children_farming_involvement=data.get('children_farming_involvement') in ['true', True, 1, '1'],
                primary_occupation=data.get('primary_occupation'),
                secondary_occupation=data.get('secondary_occupation'),
                farm_size_hectares=get_val('farm_size_hectares', float, 0),
                land_ownership=data.get('land_ownership', 'Owner'),
                years_farming=get_val('years_farming', int)
            )
            
            db.session.add(farmer)
            db.session.commit() # Commit first to get farmer.id

            # --- STEP 3: Handle Products (from JSON string) ---
            products_json = data.get('products')
            if products_json:
                try:
                    products_list = json.loads(products_json)
                    for prod_data in products_list:
                        if not prod_data.get('product_name'):
                            continue

                        # Find or Create the base Product (e.g., "Rice")
                        prod_name = prod_data['product_name'].strip()
                        agri_product = AgriculturalProduct.query.filter(
                            func.lower(AgriculturalProduct.name) == func.lower(prod_name)
                        ).first()

                        if not agri_product:
                            agri_product = AgriculturalProduct(name=prod_name, category='Crop')
                            db.session.add(agri_product)
                            db.session.commit()

                        # Link to Farmer
                        farmer_product = FarmerProduct(
                            farmer_id=farmer.id,
                            product_id=agri_product.id,
                            production_volume=prod_data.get('production_volume', 0),
                            unit=prod_data.get('unit', 'kg'),
                            is_primary=prod_data.get('is_primary', False)
                        )
                        db.session.add(farmer_product)
                    
                    db.session.commit()
                except json.JSONDecodeError:
                    print("Error decoding products JSON")

            log_activity('FARMER_CREATED', 'Farmer', farmer.id, f"Created farmer: {farmer.first_name} {farmer.last_name}")
            return jsonify({'message': 'Farmer created successfully', 'farmer': farmer.to_dict()}), 201
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ CREATE ERROR: {e}")
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/farmers/<int:id>', methods=['PUT'])
    @jwt_required()
    def update_farmer(id):
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'researcher', 'data_encoder']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        farmer = Farmer.query.get_or_404(id)
        
        try:
            data = request.form.to_dict()

            # Handle Image Upload
            if 'profile_image' in request.files:
                file = request.files['profile_image']
                new_filename = save_profile_image(file)
                if new_filename:
                    if farmer.profile_image:
                        delete_profile_image(farmer.profile_image)
                    farmer.profile_image = new_filename

            # --- FIXED LOOP ---
            # Added 'full_name' to excluded_keys to prevent "no setter" error
            excluded_keys = [
                'id', 'created_at', 'updated_at', 'data_encoder_id', 'profile_image', 
                'products', 'children', 'experiences', 
                'barangay', 'organization', 'data_encoder',
                'full_name'  # <--- CRITICAL FIX HERE
            ]

            for key, value in data.items():
                # Check if the attribute exists on the model AND is not in our exclude list
                if hasattr(farmer, key) and key not in excluded_keys:
                    
                    if key == 'birth_date':
                        if value and value != 'null' and value != '':
                            try:
                                farmer.birth_date = datetime.strptime(value[:10], '%Y-%m-%d').date()
                            except (ValueError, TypeError):
                                pass 
                        else:
                            farmer.birth_date = None
                            
                    elif key in ['barangay_id', 'organization_id', 'years_farming', 'number_of_children', 'age']:
                        if value and value != 'null' and value != '':
                            try:
                                setattr(farmer, key, int(value))
                            except (ValueError, TypeError):
                                pass
                        else:
                            # Only nullify if appropriate (don't nullify age/barangay_id if invalid)
                            if key not in ['barangay_id', 'age'] or value == '': 
                                setattr(farmer, key, None)
                    
                    elif key in ['farm_size_hectares', 'annual_income']:
                        if value and value != 'null' and value != '':
                            try:
                                setattr(farmer, key, float(value))
                            except (ValueError, TypeError):
                                pass
                        else:
                            setattr(farmer, key, None)
                            
                    elif key == 'children_farming_involvement':
                        farmer.children_farming_involvement = value in ['true', True, 1, '1']
                    
                    else:
                        setattr(farmer, key, value)

            # --- STEP 3: Handle Products Update (Delete All & Re-add) ---
            products_json = data.get('products')
            if products_json:
                try:
                    # Clear existing products
                    FarmerProduct.query.filter_by(farmer_id=farmer.id).delete()
                    
                    products_list = json.loads(products_json)
                    for prod_data in products_list:
                        if not prod_data.get('product_name'):
                            continue

                        # Find or Create Agri Product
                        prod_name = prod_data['product_name'].strip()
                        agri_product = AgriculturalProduct.query.filter(
                            func.lower(AgriculturalProduct.name) == func.lower(prod_name)
                        ).first()

                        if not agri_product:
                            agri_product = AgriculturalProduct(name=prod_name, category='Crop')
                            db.session.add(agri_product)
                            db.session.commit()

                        # Add Association
                        farmer_product = FarmerProduct(
                            farmer_id=farmer.id,
                            product_id=agri_product.id,
                            production_volume=prod_data.get('production_volume', 0),
                            unit=prod_data.get('unit', 'kg'),
                            is_primary=prod_data.get('is_primary', False)
                        )
                        db.session.add(farmer_product)
                        
                except json.JSONDecodeError:
                    print("Error decoding products JSON during update")
            
            db.session.commit()
            
            log_activity('FARMER_UPDATED', 'Farmer', farmer.id, f"Updated farmer: {farmer.first_name} {farmer.last_name}")
            return jsonify({'message': 'Farmer updated successfully', 'farmer': farmer.to_dict()}), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ UPDATE ERROR: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Failed to update record: {str(e)}'}), 400
    
    @app.route('/api/farmers/<int:id>', methods=['DELETE'])
    @jwt_required()
    def delete_farmer(id):
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        farmer = Farmer.query.get_or_404(id)
        
        if farmer.profile_image:
            delete_profile_image(farmer.profile_image)
        
        log_activity('FARMER_DELETED', 'Farmer', farmer.id, f"Deleted farmer: {farmer.first_name} {farmer.last_name}")
        
        db.session.delete(farmer)
        db.session.commit()
        
        return jsonify({'message': 'Farmer deleted successfully'}), 200
    
    # ============ Farmer Products Routes (Standalone) ============
    
    @app.route('/api/farmers/<int:farmer_id>/products', methods=['POST'])
    @jwt_required()
    def add_farmer_product(farmer_id):
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'researcher', 'data_encoder']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        product = FarmerProduct(
            farmer_id=farmer_id,
            product_id=data['product_id'],
            production_volume=data.get('production_volume'),
            unit=data.get('unit'),
            is_primary=data.get('is_primary', False),
            selling_price=data.get('selling_price')
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({'message': 'Product added successfully', 'product': product.to_dict()}), 201
    
    # ============ Farmer Children Routes ============
    
    @app.route('/api/farmers/<int:farmer_id>/children', methods=['POST'])
    @jwt_required()
    def add_farmer_child(farmer_id):
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'researcher', 'data_encoder']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        child = FarmerChild(
            farmer_id=farmer_id,
            name=data.get('name'),
            age=data.get('age'),
            gender=data.get('gender'),
            education_level=data.get('education_level'),
            continues_farming=data.get('continues_farming', False),
            involvement_level=data.get('involvement_level', 'None'),
            current_occupation=data.get('current_occupation'),
            notes=data.get('notes')
        )
        
        db.session.add(child)
        db.session.commit()
        
        return jsonify({'message': 'Child record added successfully', 'child': child.to_dict()}), 201
    
    # ============ Farmer Experiences Routes ============
    
    @app.route('/api/experiences', methods=['GET'])
    @jwt_required()
    def get_experiences():
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', app.config.get('ITEMS_PER_PAGE', 20), type=int)
        
        pagination = FarmerExperience.query.order_by(FarmerExperience.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'experiences': [exp.to_dict(include_relations=True) for exp in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
    
    @app.route('/api/experiences', methods=['POST'])
    @jwt_required()
    def create_experience():
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'researcher', 'data_encoder']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        experience = FarmerExperience(
            farmer_id=data['farmer_id'],
            experience_type=data['experience_type'],
            title=data['title'],
            description=data['description'],
            date_recorded=datetime.strptime(data['date_recorded'], '%Y-%m-%d').date() if data.get('date_recorded') else date.today(),
            interviewer_id=current_user.id,
            location=data.get('location'),
            context=data.get('context'),
            impact_level=data.get('impact_level')
        )
        
        db.session.add(experience)
        db.session.commit()
        
        log_activity('EXPERIENCE_CREATED', 'FarmerExperience', experience.id)
        
        return jsonify({'message': 'Experience recorded successfully', 'experience': experience.to_dict()}), 201
    
    # ============ Research Projects Routes ============
    
    @app.route('/api/projects', methods=['GET'])
    @jwt_required()
    def get_projects():
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', app.config.get('ITEMS_PER_PAGE', 20), type=int)
        
        pagination = ResearchProject.query.order_by(ResearchProject.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'projects': [proj.to_dict(include_relations=True) for proj in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
    
    @app.route('/api/projects', methods=['POST'])
    @jwt_required()
    def create_project():
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'researcher']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        project = ResearchProject(
            project_code=data.get('project_code'),
            title=data['title'],
            description=data.get('description'),
            principal_investigator_id=current_user.id,
            organization_id=data.get('organization_id'),
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data.get('start_date') else None,
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data.get('end_date') else None,
            status=data.get('status', 'Planning'),
            research_type=data['research_type'],
            objectives=data.get('objectives'),
            methodology=data.get('methodology'),
            budget=data.get('budget'),
            funding_source=data.get('funding_source')
        )
        
        db.session.add(project)
        db.session.commit()
        
        log_activity('PROJECT_CREATED', 'ResearchProject', project.id, f"Created project: {project.title}")
        
        return jsonify({'message': 'Project created successfully', 'project': project.to_dict()}), 201
    
    # ============ Barangay Routes ============
    
    @app.route('/api/barangays', methods=['GET'])
    @jwt_required()
    def get_barangays():
        barangays = Barangay.query.order_by(Barangay.name).all()
        return jsonify([b.to_dict() for b in barangays]), 200
    
    @app.route('/api/barangays', methods=['POST'])
    @jwt_required()
    def create_barangay():
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'data_encoder']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        barangay = Barangay(
            name=data['name'],
            municipality=data['municipality'],
            province=data['province'],
            region=data['region'],
            population=data.get('population'),
            total_households=data.get('total_households'),
            agricultural_households=data.get('agricultural_households')
        )
        
        db.session.add(barangay)
        db.session.commit()
        
        return jsonify({'message': 'Barangay created successfully', 'barangay': barangay.to_dict()}), 201
    
    # ============ Products Routes ============
    
    @app.route('/api/products', methods=['GET'])
    @jwt_required()
    def get_products():
        products = AgriculturalProduct.query.order_by(AgriculturalProduct.name).all()
        return jsonify([p.to_dict() for p in products]), 200
    
    @app.route('/api/products', methods=['POST'])
    @jwt_required()
    def create_product():
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'researcher']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        product = AgriculturalProduct(
            name=data['name'],
            category=data['category'],
            description=data.get('description')
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({'message': 'Product created successfully', 'product': product.to_dict()}), 201
    
    # ============ Organizations Routes ============
    
    @app.route('/api/organizations', methods=['GET'])
    @jwt_required()
    def get_organizations():
        organizations = Organization.query.order_by(Organization.name).all()
        return jsonify([o.to_dict() for o in organizations]), 200
    
    # ============ Export Routes ============
    
    @app.route('/api/export/farmers', methods=['GET'])
    @jwt_required()
    def export_farmers():
        try:
            farmers = Farmer.query.all()
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            writer.writerow([
                'Farmer Code', 'First Name', 'Last Name', 'Age', 'Gender', 
                'Education', 'Barangay', 'Municipality', 'Province',
                'Annual Income', 'Farm Size (ha)', 'Years Farming'
            ])
            
            for farmer in farmers:
                b_name = farmer.barangay.name if farmer.barangay else ''
                b_muni = farmer.barangay.municipality if farmer.barangay else ''
                b_prov = farmer.barangay.province if farmer.barangay else ''
                
                writer.writerow([
                    farmer.farmer_code or '',
                    farmer.first_name or '',
                    farmer.last_name or '',
                    farmer.age or '',
                    farmer.gender or '',
                    farmer.education_level or '',
                    b_name,
                    b_muni,
                    b_prov,
                    str(farmer.annual_income) if farmer.annual_income else '',
                    str(farmer.farm_size_hectares) if farmer.farm_size_hectares else '',
                    farmer.years_farming or ''
                ])
            
            csv_data = output.getvalue()
            output.close()
            
            byte_output = io.BytesIO(csv_data.encode('utf-8'))
            
            return send_file(
                byte_output,
                mimetype='text/csv',
                as_attachment=True,
                download_name=f'farmers_export_{datetime.now().strftime("%Y%m%d")}.csv'
            )
        except Exception as e:
            print(f"Export Error: {e}")
            return jsonify({'error': 'Failed to generate export file'}), 500
            
    # ============ Users Management Routes ============
    
    @app.route('/api/users', methods=['GET'])
    @jwt_required()
    def get_users():
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        users = User.query.order_by(User.created_at.desc()).all()
        return jsonify([u.to_dict() for u in users]), 200
    
    @app.route('/api/users/<int:id>', methods=['PUT'])
    @jwt_required()
    def update_user(id):
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        user = User.query.get_or_404(id)
        data = request.get_json()
        
        for key, value in data.items():
            if hasattr(user, key) and key not in ['id', 'password_hash', 'created_at']:
                setattr(user, key, value)
        
        if 'password' in data and data['password']:
            user.set_password(data['password'])
            
        try:
            db.session.commit()
            return jsonify({'message': 'User updated successfully', 'user': user.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400
    
    # ============ Activity Logs Routes ============
    
    @app.route('/api/activity-logs', methods=['GET'])
    @jwt_required()
    def get_activity_logs():
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'researcher']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        pagination = ActivityLog.query.order_by(ActivityLog.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'logs': [log.to_dict() for log in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
    
    # Initialize DB tables if they don't exist
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=5001, debug=True)